import { HttpFunction } from '@google-cloud/functions-framework';

import { getAllTrains } from './trains';

export const main: HttpFunction = (req, res) =>
  res.send(getAllTrains().toString());
