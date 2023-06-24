import { HttpFunction } from '@google-cloud/functions-framework';

import {
  getCheckedTrainsNumbers,
  runBackgroundTask,
} from './services/fetchAndSaveTrainsNumbersOnce';

let isBackgroundTaskRunning = false;

export const main: HttpFunction = async (_req, res) => {
  res.send(
    `<pre style="overflow-wrap: break-word; word-break: break-all;">Background task is ${
      isBackgroundTaskRunning ? '' : 'not '
    }running. Checked trains numbers: ${(await getCheckedTrainsNumbers()).join(
      ', ',
    )}`,
  );
};

if (!isBackgroundTaskRunning) {
  isBackgroundTaskRunning = true;

  runBackgroundTask()
    .then(() => {
      // eslint-disable-next-line no-console -- for devs
      console.log('Finished fetching trains numbers.');
    })
    .catch(err => {
      console.error(err);
    })
    .finally(() => {
      isBackgroundTaskRunning = false;
    });
}
