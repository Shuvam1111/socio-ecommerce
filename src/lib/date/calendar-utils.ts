import { BS_MONTHS, bsToAD, getBSDaysInMonth, type BSDate } from './bs';

export function getPreviousBSMonth(year: number, month: number): BSDate {
  if (month === 0) {
    return {
      year: year - 1,
      month: 11,
      day: 1,
    };
  }

  return {
    year,
    month: month - 1,
    day: 1,
  };
}

export function getNextBSMonth(year: number, month: number): BSDate {
  if (month === 11) {
    return {
      year: year + 1,
      month: 0,
      day: 1,
    };
  }

  return {
    year,
    month: month + 1,
    day: 1,
  };
}

export function getBSMonthLabel(year: number, month: number): string {
  return `${BS_MONTHS[month]} ${year}`;
}

export function getBSMonthGrid(year: number, month: number): Array<number | null> {
  const firstADDate = bsToAD(year, month, 1);
  const startingWeekday = firstADDate.getDay();
  const daysInMonth = getBSDaysInMonth(year, month);

  const cells: Array<number | null> = [];

  for (let index = 0; index < startingWeekday; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}
