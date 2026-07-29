import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BrutalInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const BrutalInput = forwardRef<HTMLInputElement, BrutalInputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'w-full px-4 py-3 border-3 border-black dark:border-white bg-white dark:bg-card text-foreground',
          'font-medium placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-3 focus:ring-black dark:focus:ring-white focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-all',
          className
        )}
        {...props}
      />
    );
  }
);

BrutalInput.displayName = 'BrutalInput';
