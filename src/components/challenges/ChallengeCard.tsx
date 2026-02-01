import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, CheckCircle, Lock, Trophy, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Challenge } from '@/types/gamification';

interface ChallengeCardProps {
  challenge: Challenge;
  onAccept?: (challenge: Challenge) => void;
  onComplete?: (challenge: Challenge) => void;
  isAccepted?: boolean;
  className?: string;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onAccept,
  onComplete,
  isAccepted = false,
  className
}) => {
  const progress = (challenge.currentProgress / challenge.targetValue) * 100;
  const isCompleted = challenge.completedAt !== undefined;
  const isExpired = new Date() > new Date(challenge.expiresAt);
  const timeLeft = Math.max(0, new Date(challenge.expiresAt).getTime() - new Date().getTime());
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  const getChallengeIcon = () => {
    switch (challenge.category) {
      case 'energy': return '⚡';
      case 'workout': return '💪';
      case 'streak': return '🔥';
      case 'social': return '👥';
      default: return '🎯';
    }
  };

  const getTypeColor = () => {
    switch (challenge.type) {
      case 'daily': return 'bg-gradient-success';
      case 'weekly': return 'bg-gradient-primary';
      case 'special': return 'bg-gradient-warning';
      default: return 'bg-secondary';
    }
  };

  const getTypeBadgeColor = () => {
    switch (challenge.type) {
      case 'daily': return 'bg-energy-high text-background';
      case 'weekly': return 'bg-primary text-primary-foreground';
      case 'special': return 'bg-accent text-accent-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Card className={cn(
      'shadow-card transition-all duration-200 hover:shadow-elevation',
      isCompleted && 'ring-2 ring-energy-high/50',
      isExpired && !isCompleted && 'opacity-60',
      challenge.isPremium && !isAccepted && 'border-accent/30',
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('h-10 w-10 rounded-full flex items-center justify-center text-lg', getTypeColor())}>
              {getChallengeIcon()}
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {challenge.title}
                {challenge.isPremium && (
                  <Lock className="h-4 w-4 text-accent" />
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{challenge.description}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge className={getTypeBadgeColor()}>
              {challenge.type}
            </Badge>
            {isCompleted && (
              <CheckCircle className="h-5 w-5 text-energy-high" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">
              {challenge.currentProgress}/{challenge.targetValue}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Time Remaining */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {isExpired ? 'Expired' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-xp" />
            <span className="font-bold text-xp">{challenge.xpReward} XP</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {!isAccepted && !challenge.isPremium && (
            <Button 
              onClick={() => onAccept?.(challenge)}
              className="w-full gap-2"
              disabled={isExpired}
            >
              <Target className="h-4 w-4" />
              Accept Challenge
            </Button>
          )}
          
          {!isAccepted && challenge.isPremium && (
            <Button 
              variant="outline"
              className="w-full gap-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              disabled
            >
              <Lock className="h-4 w-4" />
              Premium Challenge
            </Button>
          )}
          
          {isAccepted && !isCompleted && progress >= 100 && (
            <Button 
              onClick={() => onComplete?.(challenge)}
              className="w-full gap-2 bg-gradient-success hover:bg-energy-high"
            >
              <Trophy className="h-4 w-4" />
              Claim Reward
            </Button>
          )}
          
          {isAccepted && !isCompleted && progress < 100 && (
            <Button 
              variant="outline"
              className="w-full gap-2"
              disabled
            >
              <Target className="h-4 w-4" />
              In Progress
            </Button>
          )}
          
          {isCompleted && (
            <Button 
              variant="outline"
              className="w-full gap-2 bg-energy-high/10 border-energy-high text-energy-high"
              disabled
            >
              <CheckCircle className="h-4 w-4" />
              Completed
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};