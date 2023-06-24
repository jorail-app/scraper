import { prisma } from '../lib/prisma';

export const getAllTrains = () => {
  return prisma.train.findMany();
};
