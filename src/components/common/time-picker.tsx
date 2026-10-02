'use client';

import * as React from 'react';

import { CheckIcon, ChevronDownIcon, Clock3Icon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type TimePickerProps = {
  readonly value?: Date;
  readonly onChange: (date: Date) => void;
  readonly disabled?: boolean;
  readonly minuteStep?: number;
  readonly className?: string;
};

type TimePart = 'hour' | 'minute' | 'period';

function getPeriod(hours: number): 'AM' | 'PM' {
  return hours >= 12 ? 'PM' : 'AM';
}

function to12Hour(hours: number): number {
  const hour = hours % 12;

  return hour === 0 ? 12 : hour;
}

function to24Hour(hour: number, period: 'AM' | 'PM'): number {
  if (period === 'AM') {
    return hour === 12 ? 0 : hour;
  }

  return hour === 12 ? 12 : hour + 12;
}

function formatHour(hour: number): string {
  return String(hour).padStart(2, '0');
}

function formatMinute(minute: number): string {
  return String(minute).padStart(2, '0');
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function createTime(date: Date, hour: number, minute: number, period: 'AM' | 'PM'): Date {
  const nextDate = new Date(date);

  nextDate.setHours(to24Hour(hour, period), minute, 0, 0);

  return nextDate;
}

function getMinuteOptions(minuteStep: number): number[] {
  const safeStep = minuteStep > 0 && minuteStep <= 60 ? minuteStep : 5;

  const options: number[] = [];

  for (let minute = 0; minute < 60; minute += safeStep) {
    options.push(minute);
  }

  return options;
}

export function TimePicker({
  value,
  onChange,
  disabled = false,
  minuteStep = 5,
  className,
}: TimePickerProps) {
  const [openPart, setOpenPart] = React.useState<TimePart | null>(null);

  const currentHours = value?.getHours() ?? 0;
  const currentMinutes = value?.getMinutes() ?? 0;

  const selectedHour = to12Hour(currentHours);
  const selectedMinute = Math.round(currentMinutes / minuteStep) * minuteStep;

  const normalizedMinute = selectedMinute >= 60 ? 55 : selectedMinute;

  const selectedPeriod = getPeriod(currentHours);

  const minuteOptions = getMinuteOptions(minuteStep);

  const updateTime = (hour: number, minute: number, period: 'AM' | 'PM') => {
    if (!value) {
      return;
    }

    onChange(createTime(value, hour, minute, period));
  };

  const handleHourChange = (hour: number) => {
    updateTime(hour, normalizedMinute, selectedPeriod);

    setOpenPart(null);
  };

  const handleMinuteChange = (minute: number) => {
    updateTime(selectedHour, minute, selectedPeriod);

    setOpenPart(null);
  };

  const handlePeriodChange = (period: 'AM' | 'PM') => {
    updateTime(selectedHour, normalizedMinute, period);

    setOpenPart(null);
  };

  const handleTriggerClick = (part: TimePart) => {
    if (!value || disabled) {
      return;
    }

    setOpenPart((current) => (current === part ? null : part));
  };

  if (!value) {
    return (
      <div className={cn('flex h-10 items-center gap-2', className)}>
        <Clock3Icon className="size-4 text-muted-foreground" />

        <span className="text-sm text-muted-foreground">Select a date first</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Clock3Icon className="size-4 shrink-0 text-muted-foreground" />

      <div className="flex items-center gap-1">
        {/* Hour */}
        <Popover
          open={openPart === 'hour'}
          onOpenChange={(open) => setOpenPart(open ? 'hour' : null)}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => handleTriggerClick('hour')}
              className="h-9 w-[52px] px-2 text-base font-medium"
            >
              {formatHour(selectedHour)}
              <ChevronDownIcon className="ml-1 size-3.5 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent align="start" className="w-[180px] p-2">
            <div className="grid grid-cols-4 gap-1">
              {Array.from({ length: 12 }, (_, index) => index + 1).map((hour) => {
                const isSelected = hour === selectedHour;

                return (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleHourChange(hour)}
                    className={cn(
                      'flex h-9 items-center justify-center rounded-md text-sm transition-colors',
                      'hover:bg-secondary hover:text-secondary-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isSelected &&
                        'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                    )}
                  >
                    {formatHour(hour)}

                    {isSelected && <CheckIcon className="ml-1 size-3" />}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        <span className="px-0.5 text-base font-medium text-muted-foreground">:</span>

        {/* Minute */}
        <Popover
          open={openPart === 'minute'}
          onOpenChange={(open) => setOpenPart(open ? 'minute' : null)}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => handleTriggerClick('minute')}
              className="h-9 w-[58px] px-2 text-base font-medium"
            >
              {formatMinute(normalizedMinute)}
              <ChevronDownIcon className="ml-1 size-3.5 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent align="start" className="w-[220px] p-2">
            <div className="grid grid-cols-4 gap-1">
              {minuteOptions.map((minute) => {
                const isSelected = minute === normalizedMinute;

                return (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => handleMinuteChange(minute)}
                    className={cn(
                      'flex h-9 items-center justify-center rounded-md text-sm transition-colors',
                      'hover:bg-secondary hover:text-secondary-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isSelected &&
                        'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                    )}
                  >
                    {formatMinute(minute)}

                    {isSelected && <CheckIcon className="ml-1 size-3" />}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* AM / PM */}
        <Popover
          open={openPart === 'period'}
          onOpenChange={(open) => setOpenPart(open ? 'period' : null)}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => handleTriggerClick('period')}
              className="h-9 min-w-[68px] px-2 text-sm font-medium"
            >
              {selectedPeriod}
              <ChevronDownIcon className="ml-1 size-3.5 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-[110px] p-1">
            {(['AM', 'PM'] as const).map((period) => {
              const isSelected = period === selectedPeriod;

              return (
                <button
                  key={period}
                  type="button"
                  onClick={() => handlePeriodChange(period)}
                  className={cn(
                    'flex h-9 w-full items-center justify-between rounded-md px-3 text-sm transition-colors',
                    'hover:bg-secondary hover:text-secondary-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isSelected &&
                      'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                  )}
                >
                  {period}

                  {isSelected && <CheckIcon className="size-3.5" />}
                </button>
              );
            })}
          </PopoverContent>
        </Popover>
      </div>

      <span className="ml-auto text-xs text-muted-foreground">{formatTime(value)}</span>
    </div>
  );
}
