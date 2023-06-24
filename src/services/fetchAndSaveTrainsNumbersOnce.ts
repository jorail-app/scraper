import axios from 'axios';

import { prisma } from '../lib/prisma';

const PAUSE_BETWEEN_FAILED_REQUESTS = 100000;
let SHOULD_WAIT_BEFORE_NEXT_REQUEST = false;

type TrainNumbersResponse = Array<{
  Numer: string;
  Key: string;
}>;

const maxTrainNumber = 99999;

export const fetchSimilarTrainsNumbers = async (
  trainNumber: string | number,
) => {
  if (SHOULD_WAIT_BEFORE_NEXT_REQUEST) {
    await new Promise(resolve =>
      setTimeout(resolve, PAUSE_BETWEEN_FAILED_REQUESTS),
    );
    SHOULD_WAIT_BEFORE_NEXT_REQUEST = false;
  }

  try {
    const res = await axios.get<TrainNumbersResponse>(
      `https://portalpasazera.pl/Wyszukiwarka/WyszukajNumerPociagu?wprowadzonyTekst=${trainNumber}`,
    );
    return res.data;
  } catch (err) {
    SHOULD_WAIT_BEFORE_NEXT_REQUEST = true;

    console.error(err);
    return [];
  }
};

// TODO: refactor this to use Promise.all and in declarative way
export const fetchAndSaveTrainsNumbersOnce = async () => {
  const {
    lastCheckedTrainNumber,
    checkedTrainNumbers,
    finishedFetchingTrainsNumbers,
  } = (await prisma.metadata.findFirst()) ?? {};

  const checkedNumbers = new Set<string>(checkedTrainNumbers ?? []);

  let currentNumber = Number(lastCheckedTrainNumber ?? 1);
  while (currentNumber <= maxTrainNumber && !finishedFetchingTrainsNumbers) {
    if (checkedNumbers.has(currentNumber.toString())) {
      currentNumber++;
      continue;
    }

    const similarNumbers = await fetchSimilarTrainsNumbers(currentNumber);
    const trains = similarNumbers.map(similarNumber => {
      checkedNumbers.add(similarNumber.Numer);

      return {
        trainNumber: similarNumber.Numer,
        trainKey: similarNumber.Key,
      };
    });
    checkedNumbers.add(currentNumber.toString());

    await prisma.train.createMany({
      data: trains.concat({
        trainNumber: currentNumber.toString(),
        trainKey: '',
      }),
    });
    await prisma.metadata.update({
      where: { id: '6496dc9ab941e5d89f4ea4ca' }, // this `id` is hardcoded in the database as a single document
      data: {
        lastCheckedTrainNumber: currentNumber.toString(),
        checkedTrainNumbers: [...checkedNumbers.values()],
      },
    });

    currentNumber++;

    // Wait 5 seconds to not get blocked by the server
    await new Promise(resolve => setTimeout(resolve, 5000));

    // eslint-disable-next-line no-console -- for devs
    console.log([...checkedNumbers.values()]);
  }

  return true;
};

export const runBackgroundTask = async () => {
  const metadata = await prisma.metadata.findFirst();

  if (metadata?.finishedFetchingTrainsNumbers) {
    return;
  }

  await fetchAndSaveTrainsNumbersOnce();
};

export const getCheckedTrainsNumbers = async () => {
  const { checkedTrainNumbers } = (await prisma.metadata.findFirst()) ?? {};
  if (checkedTrainNumbers) {
    return checkedTrainNumbers;
  }

  return prisma.train
    .findMany()
    .then(trains => trains.map(train => train.trainNumber));
};
