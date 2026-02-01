import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Map, 
  Trophy, 
  TrendingUp, 
  Target,
  Star,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { MilestoneCard } from './MilestoneCard';
import { ProgressGuideDialog } from './ProgressGuideDialog';
import { PROGRESS_MILESTONES, LEARNING_PATHS } from '@/data/progressMilestones';
import { GameState } from '@/types/gamification';
import { updateMilestoneWithGameState } from '@/lib/progressUtils';
import { cn } from '@/lib/utils';

interface ProgressRoadmapProps {
  gameState: GameState;
  onStartMilestone?: (milestoneId: string) => void;
}

export const ProgressRoadmap: React.FC<ProgressRoadmapProps> = ({
  gameState,
  onStartMilestone
}) => {
  const [selectedPath, setSelectedPath] = useState('all');
  const [showGuide, setShowGuide] = useState(false);

  // Show guide on first visit (could be improved with localStorage)
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('progress-guide-seen');
    if (!hasSeenGuide) {
      setShowGuide(true);
      localStorage.setItem('progress-guide-seen', 'true');
    }
  }, []);

  // Calculate which milestones are unlocked based on current level
  const milestonesWithStatus = useMemo(() => {
    return PROGRESS_MILESTONES.map(milestone => 
      updateMilestoneWithGameState(milestone, gameState)
    );
  }, [gameState]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const completed = milestonesWithStatus.filter(m => m.isCompleted).length;
    return (completed / milestonesWithStatus.length) * 100;
  }, [milestonesWithStatus]);

  // Get current and next milestone
  const currentMilestone = useMemo(() => {
    return milestonesWithStatus.find(m => m.isUnlocked && !m.isCompleted);
  }, [milestonesWithStatus]);

  const nextMilestone = useMemo(() => {
    const currentIndex = milestonesWithStatus.findIndex(m => m.id === currentMilestone?.id);
    return currentIndex >= 0 && currentIndex < milestonesWithStatus.length - 1
      ? milestonesWithStatus[currentIndex + 1]
      : null;
  }, [milestonesWithStatus, currentMilestone]);

  // Filter milestones based on selected path
  const filteredMilestones = useMemo(() => {
    if (selectedPath === 'all') {
      return milestonesWithStatus;
    }
    const path = LEARNING_PATHS.find(p => p.id === selectedPath);
    if (!path) return milestonesWithStatus;
    
    const pathMilestoneIds = path.milestones.map(m => m.id);
    return milestonesWithStatus.filter(m => pathMilestoneIds.includes(m.id));
  }, [selectedPath, milestonesWithStatus]);

  // Calculate category stats
  const categoryStats = useMemo(() => {
    const stats = new Map<string, { total: number; completed: number }>();
    
    milestonesWithStatus.forEach(m => {
      const existing = stats.get(m.category) || { total: 0, completed: 0 };
      stats.set(m.category, {
        total: existing.total + 1,
        completed: existing.completed + (m.isCompleted ? 1 : 0)
      });
    });
    
    return stats;
  }, [milestonesWithStatus]);

  return (
    <div className="space-y-6">
      {/* Guide Dialog */}
      <ProgressGuideDialog 
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
      />

      {/* Header with Overall Progress */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Map className="h-6 w-6" />
                Your Progress Roadmap
              </CardTitle>
              <CardDescription className="mt-2">
                Track your journey from beginner to professional graduate level
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowGuide(true)}
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                Guide
              </Button>
              <Badge className="bg-gradient-primary text-white text-lg px-4 py-2">
                Level {gameState.level}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {milestonesWithStatus.filter(m => m.isCompleted).length} / {milestonesWithStatus.length} milestones
              </span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <div className="text-xs text-muted-foreground text-right mt-1">
              {Math.round(overallProgress)}% Complete
            </div>
          </div>

          {/* Category Progress */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Array.from(categoryStats.entries()).map(([category, stats]) => (
              <div key={category} className="text-center p-3 rounded-lg bg-secondary/30">
                <div className="text-xs font-semibold capitalize mb-1">{category}</div>
                <div className="text-lg font-bold">
                  {stats.completed}/{stats.total}
                </div>
                {stats.completed === stats.total && (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto mt-1" />
                )}
              </div>
            ))}
          </div>

          {/* Current & Next Milestone Preview */}
          {currentMilestone && (
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-lg border-2 border-primary bg-primary/5">
                <div className="text-xs font-semibold text-muted-foreground mb-1">CURRENT MILESTONE</div>
                <div className="text-lg font-bold">{currentMilestone.title}</div>
                <div className="text-sm text-muted-foreground">{currentMilestone.description}</div>
                <Button size="sm" className="mt-3" onClick={() => onStartMilestone?.(currentMilestone.id)}>
                  View Details
                </Button>
              </div>
              {nextMilestone && (
                <div className="p-4 rounded-lg border bg-secondary/30">
                  <div className="text-xs font-semibold text-muted-foreground mb-1">NEXT MILESTONE</div>
                  <div className="text-lg font-bold">{nextMilestone.title}</div>
                  <div className="text-sm text-muted-foreground">{nextMilestone.description}</div>
                  <Badge variant="outline" className="mt-3">
                    Unlocks at Level {nextMilestone.level - 2}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Paths */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Choose Your Path
          </CardTitle>
          <CardDescription>
            Select a learning path that matches your goals and timeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {LEARNING_PATHS.map(path => (
              <div
                key={path.id}
                className={cn(
                  'p-4 rounded-lg border-2 cursor-pointer transition-all',
                  selectedPath === path.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                )}
                onClick={() => setSelectedPath(path.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={path.difficulty === 'beginner' ? 'default' : 'secondary'}>
                    {path.difficulty}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{path.duration}</span>
                </div>
                <h3 className="font-bold text-lg mb-1">{path.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{path.description}</p>
                <div className="space-y-1">
                  {path.skillsImproved.slice(0, 3).map(skill => (
                    <div key={skill} className="flex items-center gap-2 text-xs">
                      <Star className="h-3 w-3 text-primary" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {selectedPath !== 'all' && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSelectedPath('all')}
            >
              View All Milestones
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Milestones Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Milestones</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {filteredMilestones.map(milestone => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              gameState={gameState}
              onStartMilestone={onStartMilestone}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
