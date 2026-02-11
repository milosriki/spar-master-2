import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedProgressBarProps {
  value: number;        // 0–100
  max?: number;
  variant?: 'xp' | 'hp' | 'energy' | 'default';
  showLabel?: boolean;
  label?: string;
  height?: string;
  className?: string;
  pulseOnFull?: boolean;
}

const variantStyles: Record<string, string> = {
  xp: 'bg-gradient-xp',
  hp: 'bg-gradient-danger',
  energy: 'bg-gradient-success',
  default: 'bg-gradient-primary',
};

const variantGlow: Record<string, string> = {
  xp: 'shadow-[0_0_12px_hsl(271_81%_56%/0.5)]',
  hp: 'shadow-[0_0_12px_hsl(0_84%_60%/0.5)]',
  energy: 'shadow-[0_0_12px_hsl(142_76%_36%/0.5)]',
  default: 'shadow-[0_0_12px_hsl(14_100%_57%/0.5)]',
};

/**
 * Animated progress bar with spring physics, gradient fills, 
 * and optional glow pulse on 100% completion.
 */
const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  value,
  max = 100,
  variant = 'default',
  showLabel = false,
  label,
  height = 'h-2.5',
  className = '',
  pulseOnFull = true,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const isFull = percentage >= 100;

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-xs font-medium text-muted-foreground">
              {label}
            </span>
          )}
          {showLabel && (
            <span className="text-xs font-semibold tabular-nums text-foreground">
              {Math.round(value)}/{max}
            </span>
          )}
        </div>
      )}
      <div
        className={`${height} w-full rounded-full overflow-hidden bg-muted/50`}
      >
        <motion.div
          className={`h-full rounded-full ${variantStyles[variant]} ${
            isFull && pulseOnFull ? `animate-pulse-glow ${variantGlow[variant]}` : ''
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            type: 'spring',
            stiffness: 80,
            damping: 15,
            mass: 0.8,
          }}
        />
      </div>
    </div>
  );
};

export default AnimatedProgressBar;
