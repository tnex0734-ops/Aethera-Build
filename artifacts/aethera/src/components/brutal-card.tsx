import { HTMLAttributes, forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface BrutalCardProps extends HTMLMotionProps<"div"> {
  variant?: 'white' | 'muted' | 'primary' | 'secondary' | 'accent' | 'success';
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
  hoverEffect?: boolean;
}

export const BrutalCard = forwardRef<HTMLDivElement, BrutalCardProps>(
  ({ className, variant = 'white', shadow = 'md', hoverEffect = false, children, ...props }, ref) => {
    const baseClasses = 'border-3 border-black dark:border-white rounded-2xl transition-all relative overflow-hidden';

    const variantClasses = {
      white: 'bg-white dark:bg-card text-foreground',
      muted: 'bg-muted text-foreground',
      primary: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      accent: 'bg-accent text-accent-foreground',
      success: 'bg-success text-success-foreground',
    };

    const shadowClasses = {
      sm: 'shadow-brutal-sm',
      md: 'shadow-brutal',
      lg: 'shadow-brutal-lg',
      xl: 'shadow-brutal-xl',
    };

    return (
      <motion.div
        ref={ref}
        whileHover={hoverEffect ? { y: -4, scale: 1.01 } : undefined}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className={cn(baseClasses, variantClasses[variant], shadowClasses[shadow], className)}
        {...(props as any)}
      >
        {children}
      </motion.div>
    );
  }
);

BrutalCard.displayName = 'BrutalCard';
