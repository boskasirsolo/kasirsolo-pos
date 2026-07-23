'use client';

/**
 * Reusable Skeleton Card component untuk standardize loading pattern di semua dashboard.
 * Gunakan ini menggantikan inline skeleton markup yang repetitif.
 * 
 * Usage:
 *   <SkeletonCard />                          // basic single-line card
 *   <SkeletonCard variant="stat" />           // KPI stat card (icon + label + value)
 *   <SkeletonCard variant="list-item" />      // horizontal list item
 *   <SkeletonCard variant="activity" />       // activity feed entry with dot icon
 *   <SkeletonCard count={3} />               // render multiple at once
 */

interface SkeletonCardProps {
  variant?: 'stat' | 'list-item' | 'activity' | 'bar-chart' | 'default';
  count?: number;
  className?: string;
}

const shared = 'animate-pulse rounded-md bg-gray-200';

export function SkeletonCard({ variant = 'default', count = 1, className }: SkeletonCardProps) {
  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} variant={variant} className={className} />
        ))}
      </>
    );
  }

  switch (variant) {
    case 'stat':
      return (
        <div className={`flex items-start gap-4 ${shared}`} style={{ minHeight: 56 }}>
          <div className={`h-12 w-12 shrink-0 rounded-xl ${shared.replace('rounded-md', 'rounded-xl')}`} />
          <div className="flex flex-1 flex-col gap-2">
            <div className={`${shared} h-4 w-20`} />
            <div className={`${shared} h-7 w-16`} />
          </div>
        </div>
      );

    case 'list-item':
      return (
        <div className={`flex items-center justify-between rounded-lg bg-gray-50 p-3 ${shared}`}>
          <div className="flex-1 space-y-2">
            <div className={`${shared} h-4 w-32`} />
            <div className={`${shared} h-3 w-24`} />
          </div>
        </div>
      );

    case 'activity':
      return (
        <div className="flex items-start gap-3">
          <div className={`h-8 w-8 shrink-0 rounded-full ${shared}`} />
          <div className="flex-1 space-y-2">
            <div className={`${shared} h-3 w-40`} />
            <div className={`${shared} h-3 w-24`} />
          </div>
        </div>
      );

    case 'bar-chart':
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className={`${shared} h-3 w-24`} />
            <div className={`${shared} h-3 w-16`} />
          </div>
          <div className={`h-6 w-full rounded-full ${shared}`} />
        </div>
      );

    case 'header':
      return (
        <div className={`flex items-center justify-between py-2 ${shared}`}>
          <div className={`${shared} h-5 w-40`} />
          <div className={`${shared} h-4 w-16 rounded-full`} />
        </div>
      );

    default:
      return <div className={`${shared} h-4 w-full`} />;
  }
}

/**
 * SkeletonList — wrapper untuk list of skeletons dengan title area.
 * Replacement untuk pola:
 *   <div className="card"><h3>...</h3><div className="space-y-3">{skeletons}</div></div>
 * 
 * Usage:
 *   <SkeletonList title="Aktivitas Terbaru" count={5} />
 *   <SkeletonList title="Data Loading..." variant="list-item" count={3} cardClassName="max-w-md" />
 */

interface SkeletonListProps {
  /** Title text above the skeletons */
  title?: string;
  variant?: 'list-item' | 'activity' | 'bar-chart' | 'stat';
  count?: number;
  cardClassName?: string;
  /** Override custom children instead of using variants */
  children?: React.ReactNode;
}

export function SkeletonList({
  title,
  variant = 'list-item',
  count = 3,
  cardClassName,
  children,
}: SkeletonListProps) {
  return (
    <div className={`card ${cardClassName ?? ''}`}>
      {title && <h3 className="mb-4 font-heading text-base font-semibold text-gray-900">{title}</h3>}
      <div className="space-y-3">
        {children ?? <SkeletonCard variant={variant} count={count} />}
      </div>
    </div>
  );
}
