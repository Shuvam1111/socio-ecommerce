'use client';

import * as React from 'react';

import { CalendarIcon, CheckIcon, ChevronDownIcon } from 'lucide-react';
import { TimePicker } from '@/components/common/time-picker';

import { BSCalendar } from '@/components/common/bs-calendar';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BS_MONTHS, adToBS } from '@/lib/date/bs';
import { cn } from '@/lib/utils';

type CalendarSystem = 'ad' | 'bs';

type DatePickerProps = {
  readonly value?: Date;
  readonly onChange: (date: Date | undefined) => void;
  readonly includeTime?: boolean;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly className?: string;
};

function formatADDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatBSDate(date: Date): string {
  const bsDate = adToBS(date);

  return `${BS_MONTHS[bsDate.month]} ${bsDate.day}, ${bsDate.year}`;
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function DatePicker({
  value,
  onChange,
  includeTime = false,
  placeholder = 'Select date',
  disabled = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const [calendarSystem, setCalendarSystem] = React.useState<CalendarSystem>('ad');

  const handleDateChange = (date: Date | undefined) => {
    if (!date) {
      onChange(undefined);
      return;
    }

    if (!includeTime || !value) {
      onChange(new Date(date));
      return;
    }

    const nextDate = new Date(date);

    nextDate.setHours(value.getHours(), value.getMinutes(), 0, 0);

    onChange(nextDate);
  };

  const handleToday = () => {
    const today = new Date();

    if (includeTime) {
      onChange(today);
    } else {
      today.setHours(0, 0, 0, 0);
      onChange(today);
    }
  };

  const handleClear = () => {
    onChange(undefined);
    setOpen(false);
  };

  const handleDone = () => {
    setOpen(false);
  };

  const displayValue = value
    ? calendarSystem === 'ad'
      ? formatADDate(value)
      : formatBSDate(value)
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="mr-2 size-4 shrink-0" />

          <span className="min-w-0 truncate">
            {displayValue}

            {includeTime && value && (
              <span className="ml-2 text-muted-foreground">{formatTime(value)}</span>
            )}
          </span>

          <ChevronDownIcon className="ml-auto size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto min-w-[300px] p-0">
        <div className="p-3">
          {/* Calendar system switch */}
          <div
            role="group"
            aria-label="Calendar system"
            className="mb-3 grid grid-cols-2 rounded-lg bg-muted p-1"
          >
            <button
              type="button"
              aria-pressed={calendarSystem === 'ad'}
              onClick={() => setCalendarSystem('ad')}
              className={cn(
                'flex h-9 items-center justify-center rounded-md text-sm font-medium transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                calendarSystem === 'ad'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {calendarSystem === 'ad' && <CheckIcon className="mr-1.5 size-3.5" />}
              AD
            </button>

            <button
              type="button"
              aria-pressed={calendarSystem === 'bs'}
              onClick={() => setCalendarSystem('bs')}
              className={cn(
                'flex h-9 items-center justify-center rounded-md text-sm font-medium transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                calendarSystem === 'bs'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {calendarSystem === 'bs' && <CheckIcon className="mr-1.5 size-3.5" />}
              BS
            </button>
          </div>

          {/* Calendar */}
          <div className="w-[320px]">
            {calendarSystem === 'ad' ? (
              <Calendar
                mode="single"
                selected={value}
                onSelect={handleDateChange}
                className="w-full"
              />
            ) : (
              <BSCalendar value={value} onChange={handleDateChange} className="w-full" />
            )}
          </div>

          {/* Time */}
          {includeTime && (
            <div className="mt-3 border-t border-border pt-3">
              <TimePicker value={value} onChange={onChange} minuteStep={5} />
            </div>
          )}
          {/* Actions */}
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <Button type="button" variant="ghost" size="sm" onClick={handleClear} disabled={!value}>
              Clear
            </Button>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>

              <Button type="button" size="sm" onClick={handleDone}>
                Done
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
