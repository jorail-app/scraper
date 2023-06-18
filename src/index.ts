import { getAllTrains } from './trains';
import { HttpFunction } from '@google-cloud/functions-framework';

export const main: HttpFunction = (req, res) =>
	res.send(getAllTrains().toString());
