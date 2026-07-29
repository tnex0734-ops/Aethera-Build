import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BrutalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'muted';
  size?: 'sm' | 'md' | 'lg';
}

export const BrutalButton = forwardRef<HTMLButtonElement, BrutalButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseClasses = 'btn-brutal inline-flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-primary text-primary-foreground border-black dark:border-white',
      secondary: 'bg-secondary text-secondary-foreground border-black dark:border-white',
      accent: 'bg-accent text-accent-foreground border-black dark:border-white',
      destructive: 'bg-destructive text-destructive-foreground border-black dark:border-white',
      muted: 'bg-muted text-muted-foreground border-black dark:border-white'
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base'
    };

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

BrutalButton.displayName = 'BrutalButton';
