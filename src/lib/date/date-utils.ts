import { adToBS, bsToAD, type BSDate } from './bs';

export function isValidDate(value: Date | undefined): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

export function getBSDate(date: Date): BSDate {
  return adToBS(date);
}

export function getADDate(year: number, month: number, day: number): Date {
  return bsToAD(year, month, day);
}
