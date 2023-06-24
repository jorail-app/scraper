import { HttpFunction } from '@google-cloud/functions-framework';

import { getAllTrains } from './services/trains';

export const main: HttpFunction = async (_req, res) => {
  const trains = await getAllTrains();

  return res.send(trains.map(train => train.trainNumber));
};
