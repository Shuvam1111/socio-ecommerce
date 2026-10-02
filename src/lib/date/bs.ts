import NepaliDate from 'nepali-datetime';
import dateConverter from 'nepali-datetime/dateConverter';

export type BSDate = {
  readonly year: number;
  readonly month: number;
  readonly day: number;
};

export const BS_MONTHS = [
  'Baisakh',
  'Jestha',
  'Ashadh',
  'Shrawan',
  'Bhadra',
  'Ashwin',
  'Kartik',
  'Mangsir',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra',
] as const;

export const BS_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function adToBS(date: Date): BSDate {
  const nepaliDate = new NepaliDate(date);

  return {
    year: nepaliDate.getYear(),
    month: nepaliDate.getMonth(),
    day: nepaliDate.getDate(),
  };
}

export function bsToAD(year: number, month: number, day: number): Date {
  const [englishYear, englishMonth, englishDay] = dateConverter.nepaliToEnglish(year, month, day);

  return new Date(englishYear, englishMonth, englishDay);
}

export function getBSDaysInMonth(year: number, month: number): number {
  return NepaliDate.getDaysOfMonth(year, month);
}
