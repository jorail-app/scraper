import axios from 'axios';

import { prisma } from '../lib/prisma';

type TrainNumbersResponse = Array<{
  Number: string;
  Key: string;
}>;

const maxTrainNumber = 99999;

export const fetchSimilarTrainsNumbers = async (
  trainNumber: string | number,
) => {
  const res = await axios.get<TrainNumbersResponse>(
    `https://portalpasazera.pl/Wyszukiwarka/WyszukajNumerPociagu?wprowadzonyTekst=${trainNumber}`,
  );
  return res.data;
};

// TODO: refactor this to use Promise.all and in declarative way
export const fetchAndSaveTrainsNumbersOnce = async () => {
  const checkedNumbers = new Set();
  let currentNumber = 1;

  while (currentNumber <= maxTrainNumber) {
    if (checkedNumbers.has(currentNumber)) {
      currentNumber++;
      continue;
    }

    const similarNumbers = await fetchSimilarTrainsNumbers(currentNumber);
    const trains = similarNumbers.map(similarNumber => {
      checkedNumbers.add(similarNumber.Number);

      return {
        trainNumber: similarNumber.Number,
        trainKey: similarNumber.Key,
      };
    });

    await prisma.train.createMany({ data: trains });
    await prisma.metadata.update({
      where: { id: '6496dc9ab941e5d89f4ea4ca' }, // this `id` is hardcoded in the database as a single document
      data: { lastCheckedTrainNumber: currentNumber.toString() },
    });

    currentNumber++;

    // Wait 1.5 seconds to not get blocked by the server
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  return prisma.train.findMany();
};

export const runBackgroundTask = async () => {
  const metadata = await prisma.metadata.findFirst();

  if (metadata?.finishedFetchingTrainsNumbers) {
    return;
  }

  await fetchAndSaveTrainsNumbersOnce();
};

export const getLastCheckedTrainNumber = () =>
  prisma.metadata
    .findFirst()
    .then(metadata => metadata?.lastCheckedTrainNumber);
