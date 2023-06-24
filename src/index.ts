import { HttpFunction } from '@google-cloud/functions-framework';

import {
  getLastCheckedTrainNumber,
  runBackgroundTask,
} from './services/fetchAndSaveTrainsNumbersOnce';

export const main: HttpFunction = async (_req, res) => {
  res.send(
    `Last checked train number is  ${(await getLastCheckedTrainNumber()) ?? 1}`,
  );
};

runBackgroundTask()
  .then(() => {
    // eslint-disable-next-line no-console -- for devs
    console.log('Finished fetching trains numbers');
  })
  .catch(err => {
    console.error(err);
  });
