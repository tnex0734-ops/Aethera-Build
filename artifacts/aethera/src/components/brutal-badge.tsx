import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BrutalBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'muted';
}

export const BrutalBadge = forwardRef<HTMLSpanElement, BrutalBadgeProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-1 text-xs font-bold uppercase tracking-wide border-2 border-black dark:border-white';
    
    const variantClasses = {
      primary: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      accent: 'bg-accent text-accent-foreground',
      muted: 'bg-muted text-muted-foreground'
    };

    return (
      <span
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

BrutalBadge.displayName = 'BrutalBadge';
