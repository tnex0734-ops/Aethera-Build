import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BrutalCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'white' | 'muted' | 'primary' | 'secondary' | 'accent';
  shadow?: 'sm' | 'md' | 'lg';
}

export const BrutalCard = forwardRef<HTMLDivElement, BrutalCardProps>(
  ({ className, variant = 'white', shadow = 'md', children, ...props }, ref) => {
    const baseClasses = 'border-3 border-black dark:border-white transition-all';
    
    const variantClasses = {
      white: 'bg-white dark:bg-card text-foreground',
      muted: 'bg-muted text-muted-foreground',
      primary: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      accent: 'bg-accent text-accent-foreground'
    };

    const shadowClasses = {
      sm: 'shadow-brutal',
      md: 'shadow-brutal-lg',
      lg: 'shadow-brutal-xl'
    };

    return (
      <div
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], shadowClasses[shadow], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BrutalCard.displayName = 'BrutalCard';
