import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BrutalBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'muted' | 'success' | 'warning';
}

export function BrutalBadge({ className, variant = 'primary', children, ...props }: BrutalBadgeProps) {
  const baseClasses = 'inline-flex items-center gap-1 font-extrabold uppercase text-[11px] px-2.5 py-1 rounded-full border-2 border-black dark:border-white shadow-brutal-sm tracking-wider select-none';

  const variantClasses = {
    primary: 'bg-primary text-black',
    secondary: 'bg-secondary text-white',
    accent: 'bg-accent text-white',
    muted: 'bg-muted text-foreground',
    success: 'bg-success text-white',
    warning: 'bg-warning text-black',
  };

  return (
    <span className={cn(baseClasses, variantClasses[variant], className)} {...props}>
      {children}
    </span>
  );
}
