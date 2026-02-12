import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GameState, CharacterClass } from '@/types/gamification';
import { Heart, Coins, Gem, Shield, Swords, Sparkles, Zap } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import AnimatedProgressBar from '@/components/ui/AnimatedProgressBar';

interface CharacterStatsProps {
  gameState: GameState;
}

const CLASS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  novice: { label: 'Novice', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: <Shield className="w-3.5 h-3.5" /> },
  warrior: { label: 'Warrior', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <Swords className="w-3.5 h-3.5" /> },
  mage: { label: 'Mage', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <Sparkles className="w-3.5 h-3.5" /> },
  healer: { label: 'Healer', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: <Heart className="w-3.5 h-3.5" /> },
  rogue: { label: 'Rogue', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: <Zap className="w-3.5 h-3.5" /> },
};

export const CharacterStats: React.FC<CharacterStatsProps> = ({ gameState }) => {
  const {
    currentHP, maxHP, gold, gems, level,
    totalXP, xpToNextLevel, characterClass, currentStreak,
  } = gameState;

  const hpPercentage = (currentHP / maxHP) * 100;
  const xpForLevel = Math.pow(level, 2) * 100;
  const currentLevelXP = totalXP - Math.pow(level - 1, 2) * 100;
  const xpPercentage = Math.min(100, (currentLevelXP / (xpForLevel - Math.pow(level - 1, 2) * 100)) * 100);
  const classConfig = CLASS_CONFIG[characterClass] || CLASS_CONFIG.novice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
    >
      <Card className="glass-card border-0 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2 font-heading">
              <Shield className="w-5 h-5 text-primary" />
              Character
            </CardTitle>
            <Badge variant="outline" className={`${classConfig.color} border flex items-center gap-1 px-2.5 py-0.5`}>
              {classConfig.icon}
              {classConfig.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Level Badge with glow */}
          <div className="flex items-center justify-center">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center ring-2 ring-primary/30 shadow-glow">
                <AnimatedCounter value={level} className="text-2xl font-black text-white font-heading" />
              </div>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground font-medium tracking-wider uppercase">Level</span>
            </motion.div>
          </div>

          {/* HP Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-foreground/80 font-medium">
                <Heart className="w-4 h-4 text-hp" fill="currentColor" />
                Health
              </span>
              <span className="text-muted-foreground font-mono text-xs">
                <AnimatedCounter value={currentHP} className="text-hp" />/{maxHP}
              </span>
            </div>
            <AnimatedProgressBar
              value={currentHP}
              max={maxHP}
              variant="hp"
              height="h-3"
            />
          </div>

          {/* XP Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-foreground/80 font-medium">
                <Sparkles className="w-4 h-4 text-xp" />
                Experience
              </span>
              <span className="text-muted-foreground font-mono text-xs">
                <AnimatedCounter value={xpToNextLevel} className="text-xp" /> XP to next
              </span>
            </div>
            <AnimatedProgressBar
              value={currentLevelXP}
              max={xpForLevel - Math.pow(level - 1, 2) * 100}
              variant="xp"
              height="h-3"
            />
          </div>

          {/* Currency + Streak Row */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <motion.div
              whileHover={{ y: -2 }}
              className="stat-card flex flex-col items-center gap-1 cursor-default"
            >
              <Coins className="w-4 h-4 text-gold" />
              <AnimatedCounter value={gold} className="text-sm font-bold text-gold" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Gold</span>
            </motion.div>
            <motion.div
              whileHover={{ y: -2 }}
              className="stat-card flex flex-col items-center gap-1 cursor-default"
            >
              <Gem className="w-4 h-4 text-gems" />
              <AnimatedCounter value={gems} className="text-sm font-bold text-gems" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Gems</span>
            </motion.div>
            <motion.div
              whileHover={{ y: -2 }}
              className="stat-card flex flex-col items-center gap-1 cursor-default"
            >
              <Zap className="w-4 h-4 text-streak" />
              <AnimatedCounter value={currentStreak} className="text-sm font-bold text-streak" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Streak</span>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CharacterStats;
