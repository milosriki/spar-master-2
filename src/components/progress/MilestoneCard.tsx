import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, 
  Target, 
  Star, 
  Lock, 
  CheckCircle2, 
  TrendingUp,
  Award,
  Zap,
  Crown,
  Flame
} from 'lucide-react';
import { ProgressMilestone } from '@/types/progressRoadmap';
import { GameState } from '@/types/gamification';
import { calculateRequirementProgress, calculateRequirementPercentage } from '@/lib/progressUtils';
import { cn } from '@/lib/utils';

interface MilestoneCardProps {
  milestone: ProgressMilestone;
  gameState: GameState;
  onStartMilestone?: (milestoneId: string) => void;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  gameState,
  onStartMilestone
}) => {
  // Calculate progress for each requirement using utility function
  const calculateProgress = (req: typeof milestone.requirements[0]) => {
    const current = calculateRequirementProgress(req, gameState);
    return calculateRequirementPercentage(current, req.target);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'beginner':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'intermediate':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'advanced':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'professional':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'elite':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-yellow-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'beginner':
        return <Target className="h-4 w-4" />;
      case 'intermediate':
        return <TrendingUp className="h-4 w-4" />;
      case 'advanced':
        return <Flame className="h-4 w-4" />;
      case 'professional':
        return <Award className="h-4 w-4" />;
      case 'elite':
        return <Crown className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getRequirementIcon = (type: string) => {
    switch (type) {
      case 'xp':
        return <Trophy className="h-4 w-4" />;
      case 'streak':
        return <Flame className="h-4 w-4" />;
      case 'workouts':
        return <Zap className="h-4 w-4" />;
      case 'challenges':
        return <Target className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  return (
    <Card className={cn(
      'shadow-card transition-all duration-300',
      milestone.isUnlocked ? 'opacity-100' : 'opacity-60',
      milestone.isCompleted && 'border-2 border-green-500'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={cn('border', getCategoryColor(milestone.category))}>
                {getCategoryIcon(milestone.category)}
                <span className="ml-1 capitalize">{milestone.category}</span>
              </Badge>
              <Badge variant="outline">Level {milestone.level}</Badge>
              {milestone.isCompleted && (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
              {!milestone.isUnlocked && (
                <Badge variant="secondary">
                  <Lock className="h-3 w-3 mr-1" />
                  Locked
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl">{milestone.title}</CardTitle>
            <CardDescription>{milestone.description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Requirements */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Requirements
          </h4>
          <div className="space-y-3">
            {milestone.requirements.map((req) => {
              const progress = calculateProgress(req);
              const isComplete = progress >= 100;
              
              return (
                <div key={req.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getRequirementIcon(req.type)}
                      <span className={cn(
                        'font-medium',
                        isComplete && 'text-green-500'
                      )}>
                        {req.description}
                      </span>
                      {isComplete && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="text-xs text-muted-foreground text-right">
                    {Math.round(progress)}% Complete
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Rewards */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Rewards
          </h4>
          <div className="grid gap-2">
            {milestone.rewards.map((reward, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="font-medium">{reward.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        {milestone.isUnlocked && !milestone.isCompleted && (
          <Button 
            className="w-full"
            onClick={() => onStartMilestone?.(milestone.id)}
          >
            Start This Milestone
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
