import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Shield, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  currentStreak: number;
  bestStreak: number;
  multiplier: number;
  freezeCount?: number;
  isAtRisk?: boolean;
  hoursLeft?: number;
  className?: string;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
  currentStreak,
  bestStreak,
  multiplier,
  freezeCount = 0,
  isAtRisk = false,
  hoursLeft,
  className
}) => {
  const getStreakStatus = () => {
    if (currentStreak >= 30) return { level: 'legendary', color: 'text-accent', bg: 'bg-gradient-warning' };
    if (currentStreak >= 14) return { level: 'epic', color: 'text-primary', bg: 'bg-gradient-primary' };
    if (currentStreak >= 7) return { level: 'impressive', color: 'text-streak', bg: 'bg-gradient-primary' };
    return { level: 'building', color: 'text-muted-foreground', bg: 'bg-secondary' };
  };

  const { level, color, bg } = getStreakStatus();

  return (
    <Card className={cn('border-0 shadow-card', isAtRisk && 'ring-2 ring-destructive', className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Streak Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn('relative', isAtRisk && 'animate-pulse')}>
                <Flame className={cn('h-6 w-6', color)} />
                {currentStreak >= 7 && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full animate-ping" />
                )}
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">{currentStreak}</div>
                <div className="text-xs text-muted-foreground capitalize">{level} streak</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-bold text-xp">{multiplier}x XP</div>
              <div className="text-xs text-muted-foreground">Multiplier</div>
            </div>
          </div>

          {/* Streak Progress Visualization */}
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(currentStreak, 10) }).map((_, i) => (
              <div 
                key={i}
                className={cn(
                  'h-2 w-2 rounded-full transition-all duration-200',
                  i < currentStreak ? bg : 'bg-secondary/50'
                )}
              />
            ))}
            {currentStreak > 10 && (
              <span className="text-xs text-muted-foreground ml-1">+{currentStreak - 10}</span>
            )}
          </div>

          {/* Best Streak */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Best: {bestStreak} days</span>
            </div>
            
            {/* Freeze Count (Premium Feature) */}
            {freezeCount > 0 && (
              <div className="flex items-center gap-1 text-accent">
                <Shield className="h-3 w-3" />
                <span>{freezeCount} freezes</span>
              </div>
            )}
          </div>

          {/* Risk Warning */}
          {isAtRisk && hoursLeft && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-2">
              <div className="flex items-center gap-2 text-destructive">
                <Flame className="h-4 w-4 animate-pulse" />
                <div>
                  <div className="text-sm font-bold">Streak at risk!</div>
                  <div className="text-xs">{hoursLeft}h left to save your {currentStreak}-day streak</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};