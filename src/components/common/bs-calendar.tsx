'use client';

import * as React from 'react';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { BS_MONTHS, BS_WEEKDAYS, adToBS, bsToAD, type BSDate } from '@/lib/date/bs';
import { getBSMonthGrid, getNextBSMonth, getPreviousBSMonth } from '@/lib/date/calendar-utils';
import { cn } from '@/lib/utils';

type BSCalendarProps = {
  readonly value?: Date;
  readonly onChange: (date: Date) => void;
  readonly className?: string;
};

function isSameBSDate(first: BSDate | undefined, second: BSDate | undefined): boolean {
  if (!first || !second) {
    return false;
  }

  return first.year === second.year && first.month === second.month && first.day === second.day;
}

export function BSCalendar({ value, onChange, className }: BSCalendarProps) {
  const selectedBS = value ? adToBS(value) : undefined;

  const todayBS = adToBS(new Date());

  const [displayDate, setDisplayDate] = React.useState<BSDate>(() => ({
    year: selectedBS?.year ?? todayBS.year,
    month: selectedBS?.month ?? todayBS.month,
    day: 1,
  }));

  const days = getBSMonthGrid(displayDate.year, displayDate.month);

  const handlePreviousMonth = () => {
    setDisplayDate(getPreviousBSMonth(displayDate.year, displayDate.month));
  };

  const handleNextMonth = () => {
    setDisplayDate(getNextBSMonth(displayDate.year, displayDate.month));
  };

  const handleDaySelect = (day: number) => {
    const selectedAD = bsToAD(displayDate.year, displayDate.month, day);

    /*
     * Preserve the existing time when selecting
     * another BS date.
     */
    if (value) {
      selectedAD.setHours(
        value.getHours(),
        value.getMinutes(),
        value.getSeconds(),
        value.getMilliseconds(),
      );
    }

    onChange(selectedAD);
  };

  return (
    <div className={cn('w-full rounded-lg bg-background p-3', className)}>
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handlePreviousMonth}
          aria-label="Previous BS month"
        >
          <ChevronLeftIcon className="size-4" />
        </Button>

        <div className="text-sm font-medium">
          {BS_MONTHS[displayDate.month]} {displayDate.year}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          aria-label="Next BS month"
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      <div className="grid w-full grid-cols-7">
        {BS_WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="flex h-9 items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {weekday}
          </div>
        ))}

        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} aria-hidden="true" />;
          }

          const dayDate: BSDate = {
            year: displayDate.year,
            month: displayDate.month,
            day,
          };

          const isSelected = isSameBSDate(dayDate, selectedBS);

          const isToday = isSameBSDate(dayDate, todayBS);

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDaySelect(day)}
              aria-label={`${BS_MONTHS[displayDate.month]} ${day}, ${displayDate.year}`}
              aria-pressed={isSelected}
              className={cn(
                'flex h-9 w-full items-center justify-center rounded-md text-sm transition-colors',
                'hover:bg-secondary hover:text-secondary-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isToday && !isSelected && 'bg-muted font-semibold text-foreground',
                isSelected &&
                  'bg-primary font-medium text-primary-foreground hover:bg-primary hover:text-primary-foreground',
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
