import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, CheckCircle, Timer, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MicroWin } from '@/types/gamification';

interface MicroWinCardProps {
  microWin: MicroWin;
  onComplete: (microWin: MicroWin) => void;
  className?: string;
}

export const MicroWinCard: React.FC<MicroWinCardProps> = ({
  microWin,
  onComplete,
  className
}) => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(microWin.duration);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setIsCompleted(true);
            onComplete(microWin);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, microWin, onComplete]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((microWin.duration - timeLeft) / microWin.duration) * 100;

  const getCategoryIcon = () => {
    switch (microWin.category) {
      case 'breathing': return '🫁';
      case 'movement': return '🏃';
      case 'hydration': return '💧';
      case 'posture': return '🧘';
      default: return '⚡';
    }
  };

  const getCategoryColor = () => {
    switch (microWin.category) {
      case 'breathing': return 'bg-gradient-success';
      case 'movement': return 'bg-gradient-primary';
      case 'hydration': return 'bg-blue-500';
      case 'posture': return 'bg-gradient-warning';
      default: return 'bg-gradient-primary';
    }
  };

  if (isCompleted) {
    return (
      <Card className={cn('border-energy-high/50 bg-gradient-to-r from-energy-high/10 to-transparent shadow-glow', className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-energy-high" />
            <div className="flex-1">
              <div className="font-semibold text-foreground">Micro Win Completed! 🎉</div>
              <div className="text-sm text-muted-foreground">{microWin.name}</div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-xp" />
                <span className="font-bold text-xp">+{microWin.xpReward} XP</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-energy-high" />
                <span className="text-xs text-energy-high">+{microWin.energyBoost} Energy</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-primary/20 shadow-card', className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className={cn('h-10 w-10 rounded-full flex items-center justify-center text-lg', getCategoryColor())}>
              {getCategoryIcon()}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{microWin.name}</h3>
              <p className="text-sm text-muted-foreground">{microWin.description}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Timer className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{Math.ceil(microWin.duration / 60)}min</span>
              </div>
            </div>
          </div>

          {/* Instructions (only show when active) */}
          {isActive && (
            <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
              <h4 className="text-sm font-medium text-foreground">Instructions:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                {microWin.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Timer Display */}
          <div className="text-center space-y-3">
            <div className="text-3xl font-bold text-foreground font-mono">
              {formatTime(timeLeft)}
            </div>
            
            {isActive && (
              <Progress value={progress} className="h-2" />
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {!isActive ? (
                <Button onClick={handleStart} size="sm" className="gap-2">
                  <Play className="h-4 w-4" />
                  Start Micro Win
                </Button>
              ) : (
                <Button onClick={handlePause} variant="outline" size="sm" className="gap-2">
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
              )}
            </div>
            
            <div className="text-right text-xs">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-xp" />
                <span className="text-xp font-bold">{microWin.xpReward} XP</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-energy-high" />
                <span className="text-energy-high">{microWin.energyBoost} Energy</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};