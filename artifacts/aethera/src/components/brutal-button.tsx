import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface BrutalButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'muted' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isMagnetic?: boolean;
}

export const BrutalButton = forwardRef<HTMLButtonElement, BrutalButtonProps>(
  ({ className, variant = 'primary', size = 'md', isMagnetic = true, children, disabled, onClick, ...props }, ref) => {
    const baseClasses =
      'btn-brutal inline-flex items-center justify-center gap-2 rounded-xl transition-all cursor-pointer font-extrabold uppercase tracking-wide select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

    const variantClasses = {
      primary: 'bg-primary text-primary-foreground border-black dark:border-white shadow-brutal hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground border-black dark:border-white shadow-brutal hover:bg-secondary/90',
      accent: 'bg-accent text-accent-foreground border-black dark:border-white shadow-brutal hover:bg-accent/90',
      destructive: 'bg-destructive text-destructive-foreground border-black dark:border-white shadow-brutal hover:bg-destructive/90',
      muted: 'bg-muted text-foreground border-black dark:border-white shadow-brutal hover:bg-muted/80',
      success: 'bg-success text-success-foreground border-black dark:border-white shadow-brutal hover:bg-success/90',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={disabled ? {} : { scale: 1.02, x: -2, y: -2 }}
        whileTap={disabled ? {} : { scale: 0.98, x: 2, y: 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        data-cursor={isMagnetic ? 'magnetic' : undefined}
        onClick={onClick}
        disabled={disabled}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...(props as any)}
      >
        {children}
      </motion.button>
    );
  }
);

BrutalButton.displayName = 'BrutalButton';
