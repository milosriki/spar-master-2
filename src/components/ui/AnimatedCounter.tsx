import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform, MotionValue } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  colorOnChange?: boolean;
  formatFn?: (val: number) => string;
}

/**
 * Smooth animated number counter with spring physics.
 * Shows a color flash on value change: green for increase, red for decrease.
 */
const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 0.8,
  className = '',
  prefix = '',
  suffix = '',
  colorOnChange = true,
  formatFn,
}) => {
  const springValue = useSpring(0, {
    stiffness: 100,
    damping: 20,
    duration: duration * 1000,
  });

  const [displayValue, setDisplayValue] = useState(value);
  const [flash, setFlash] = useState<'none' | 'gain' | 'loss'>('none');
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      const diff = value - prevValue.current;
      if (colorOnChange) {
        setFlash(diff > 0 ? 'gain' : 'loss');
        const timer = setTimeout(() => setFlash('none'), 600);
        return () => clearTimeout(timer);
      }
      prevValue.current = value;
    }
  }, [value, colorOnChange]);

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(Math.round(latest));
    });
    return unsubscribe;
  }, [springValue]);

  const flashClass =
    flash === 'gain'
      ? 'text-emerald-400'
      : flash === 'loss'
      ? 'text-red-400'
      : '';

  const formattedValue = formatFn
    ? formatFn(displayValue)
    : displayValue.toLocaleString();

  return (
    <motion.span
      className={`tabular-nums transition-colors duration-300 ${flashClass} ${className}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {prefix}
      {formattedValue}
      {suffix}
    </motion.span>
  );
};

export default AnimatedCounter;
