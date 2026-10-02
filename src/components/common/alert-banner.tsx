'use client';

import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type AlertBannerVariant = 'success' | 'warning' | 'error' | 'info';

type AlertBannerProps = {
  readonly variant?: AlertBannerVariant;
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
  readonly onDismiss?: () => void;
  readonly className?: string;
};

const variantConfig = {
  success: {
    icon: CheckCircle2,
    iconClassName: 'text-success',
    iconBackground: 'bg-success/12 border-success/20',
    border: 'border-success/30',
    background: 'bg-success/[0.07]',
  },

  warning: {
    icon: TriangleAlert,
    iconClassName: 'text-warning',
    iconBackground: 'bg-warning/12 border-warning/20',
    border: 'border-warning/30',
    background: 'bg-warning/[0.08]',
  },

  error: {
    icon: XCircle,
    iconClassName: 'text-destructive',
    iconBackground: 'bg-destructive/12 border-destructive/20',
    border: 'border-destructive/30',
    background: 'bg-destructive/[0.07]',
  },

  info: {
    icon: Info,
    iconClassName: 'text-info',
    iconBackground: 'bg-info/12 border-info/20',
    border: 'border-info/30',
    background: 'bg-info/[0.07]',
  },
} as const;

export function AlertBanner({
  variant = 'info',
  title,
  description,
  action,
  onDismiss,
  className,
}: AlertBannerProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const hasActions = Boolean(action || onDismiss);

  return (
    <div
      role="alert"
      className={cn(
        'w-full rounded-xl border p-4',
        'sm:p-5',
        config.border,
        config.background,
        className,
      )}
    >
      <div className="flex items-start gap-3.5 sm:gap-4">
        {/* Icon */}
        <div
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg border',
            'sm:size-10',
            config.iconBackground,
          )}
        >
          <Icon className={cn('size-[18px] sm:size-5', config.iconClassName)} aria-hidden="true" />
        </div>

        {/* Content */}
        <div className={cn('min-w-0 flex-1', !description && 'self-center')}>
          <p className="text-sm font-semibold leading-5 text-foreground sm:text-[15px]">{title}</p>

          {description && (
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Desktop dismiss */}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className={cn(
              'hidden size-8 shrink-0 items-center justify-center rounded-md sm:inline-flex',
              'text-muted-foreground transition-colors',
              'hover:bg-background/70 hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Actions */}
      {hasActions && (
        <div
          className={cn(
            'mt-3 flex flex-wrap items-center gap-2',
            'sm:ml-14 sm:mt-3',
            'lg:ml-14 lg:mt-0 lg:justify-end',
            'lg:relative lg:-mt-8',
          )}
        >
          {action}

          {/* Mobile dismiss */}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss notification"
              className={cn(
                'inline-flex size-8 shrink-0 items-center justify-center rounded-md sm:hidden',
                'text-muted-foreground transition-colors',
                'hover:bg-background/70 hover:text-foreground',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-ring focus-visible:ring-offset-2',
              )}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
