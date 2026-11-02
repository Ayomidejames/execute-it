import React from 'react';
import { cn } from '../../lib/utils';

export interface ProgressBarProps {
  value: number; // 0 to 100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string; // custom hex or color class
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  showLabel = false,
  size = 'md',
  color,
  className,
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            {clamped}% completed
          </span>
        )}
      </div>
      <div
        className={cn(
          'w-full bg-slate-100 dark:bg-navy-800 rounded-full overflow-hidden',
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            !color && (
              clamped === 100
                ? 'bg-emerald-500'
                : clamped > 50
                ? 'bg-brand-600'
                : clamped > 0
                ? 'bg-brand-500'
                : 'bg-slate-300 dark:bg-navy-700'
            )
          )}
          style={{
            width: `${clamped}%`,
            backgroundColor: color ? color : undefined,
          }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
