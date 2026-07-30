import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BrutalInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const BrutalInput = forwardRef<HTMLInputElement, BrutalInputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'w-full bg-white dark:bg-card border-3 border-black dark:border-white px-4 py-2.5 rounded-xl font-medium text-sm text-foreground shadow-brutal outline-none transition-all focus:ring-4 focus:ring-primary/40 focus:border-primary placeholder:text-muted-foreground/70 disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
    );
  }
);

BrutalInput.displayName = 'BrutalInput';
