import type { LucideIcon } from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value?: number;
  icon: LucideIcon;
  description?: string;
  isLoading?: boolean;
}

export function AdminStatCard({
  title,
  value,
  icon: Icon,
  description,
  isLoading = false,
}: AdminStatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>

          {isLoading ? (
            <div
              className="mt-2 h-9 w-16 animate-pulse rounded-md bg-muted"
              aria-label={`Loading ${title.toLowerCase()}`}
              role="status"
            />
          ) : (
            <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          )}

          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </div>

        <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}
