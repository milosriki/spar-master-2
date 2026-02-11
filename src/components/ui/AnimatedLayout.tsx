import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedLayoutProps {
  children: React.ReactNode;
  id: string;            // unique key for AnimatePresence (e.g. tab name)
  className?: string;
  staggerChildren?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 22,
    },
  },
};

/**
 * Wrap tab/page content for smooth enter/exit transitions.
 * Use AnimatedItem for staggered children.
 */
const AnimatedLayout: React.FC<AnimatedLayoutProps> = ({
  children,
  id,
  className = '',
  staggerChildren = true,
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        variants={staggerChildren ? containerVariants : undefined}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Individual staggered child — wrap each card/section in this.
 */
export const AnimatedItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
};

export default AnimatedLayout;
