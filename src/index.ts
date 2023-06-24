import { HttpFunction } from '@google-cloud/functions-framework';

import {
  getCheckedTrainsNumbers,
  runBackgroundTask,
} from './services/fetchAndSaveTrainsNumbersOnce';

export const main: HttpFunction = async (_req, res) => {
  res.send(
    `<pre style="text-wrap: balance;">Checked trains numbers: ${(
      await getCheckedTrainsNumbers()
    ).join(', ')}`,
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
