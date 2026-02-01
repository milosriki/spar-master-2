import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface XPProgressProps {
  currentXP: number;
  level: number;
  xpToNext: number;
  dailyXP: number;
  className?: string;
}

export const XPProgress: React.FC<XPProgressProps> = ({
  currentXP,
  level,
  xpToNext,
  dailyXP,
  className
}) => {
  const currentLevelXP = Math.pow(level - 1, 2) * 100;
  const nextLevelXP = Math.pow(level, 2) * 100;
  const progressInLevel = currentXP - currentLevelXP;
  const totalXPForLevel = nextLevelXP - currentLevelXP;
  const percentage = (progressInLevel / totalXPForLevel) * 100;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Level and XP Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Star className="h-6 w-6 text-level fill-level" />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-background">
              {level}
            </span>
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">Level {level}</div>
            <div className="text-xs text-muted-foreground">Elite Warrior</div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-bold text-xp">{xpToNext} XP to next</div>
          <div className="text-xs text-muted-foreground">{currentXP.toLocaleString()} total</div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="relative">
        <Progress 
          value={percentage} 
          className="h-4 bg-secondary/30"
        />
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-xp rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
        
        {/* Glow effect when close to level up */}
        {percentage >= 85 && (
          <div 
            className="absolute top-0 left-0 h-full bg-xp/30 rounded-full blur-sm animate-pulse"
            style={{ width: `${percentage}%` }}
          />
        )}
        
        {/* Progress text overlay */}
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-background">
          {Math.round(percentage)}%
        </div>
      </div>

      {/* Daily XP Achievement */}
      {dailyXP > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3 text-xp" />
          <span>+{dailyXP} XP earned today</span>
          {dailyXP >= 100 && (
            <span className="text-xp font-bold">🔥 On fire!</span>
          )}
        </div>
      )}
    </div>
  );
};