import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type RewardType = 'xp' | 'gold' | 'gems' | 'hp' | 'streak';

interface Reward {
  id: number;
  text: string;
  type: RewardType;
  x: number;
  y: number;
}

interface FloatingRewardProps {
  rewards: Reward[];
  onComplete?: (id: number) => void;
}

const rewardColors: Record<RewardType, string> = {
  xp: 'text-purple-400',
  gold: 'text-yellow-400',
  gems: 'text-violet-400',
  hp: 'text-red-400',
  streak: 'text-orange-400',
};

const rewardIcons: Record<RewardType, string> = {
  xp: '✦',
  gold: '●',
  gems: '◆',
  hp: '♥',
  streak: '🔥',
};

/**
 * Floating "+15 XP" / "+5 Gold" text that rises and fades out.
 * Spawns from specified position with spring deceleration.
 */
const FloatingReward: React.FC<FloatingRewardProps> = ({ rewards, onComplete }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      <AnimatePresence>
        {rewards.map((reward) => (
          <motion.div
            key={reward.id}
            className={`absolute font-heading font-bold text-sm ${rewardColors[reward.type]}`}
            style={{ left: reward.x, top: reward.y }}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -50, scale: 1.1 }}
            exit={{ opacity: 0, y: -80, scale: 0.8 }}
            transition={{
              type: 'spring',
              stiffness: 150,
              damping: 12,
              mass: 0.5,
              duration: 1.2,
            }}
            onAnimationComplete={() => onComplete?.(reward.id)}
          >
            <span className="drop-shadow-[0_0_8px_currentColor]">
              {rewardIcons[reward.type]} {reward.text}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * Hook to manage floating rewards state.
 * Returns [rewards, spawnReward, removeReward].
 */
export function useFloatingRewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  let nextId = React.useRef(0);

  const spawnReward = (
    text: string,
    type: RewardType,
    x: number = 0,
    y: number = 0,
  ) => {
    const id = nextId.current++;
    setRewards((prev) => [...prev, { id, text, type, x, y }]);

    // Auto-cleanup after animation
    setTimeout(() => {
      setRewards((prev) => prev.filter((r) => r.id !== id));
    }, 1500);
  };

  const removeReward = (id: number) => {
    setRewards((prev) => prev.filter((r) => r.id !== id));
  };

  return { rewards, spawnReward, removeReward };
}

export default FloatingReward;
