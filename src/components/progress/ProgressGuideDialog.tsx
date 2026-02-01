import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  TrendingUp, 
  Award, 
  Zap,
  CheckCircle2 
} from 'lucide-react';

interface ProgressGuideDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProgressGuideDialog: React.FC<ProgressGuideDialogProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            Welcome to Your Progress Roadmap!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base space-y-4 pt-4">
            <p className="text-foreground font-medium">
              Track your journey from beginner to professional level with our comprehensive milestone system.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Clear Milestones</h4>
                  <p className="text-sm">
                    7 progressive milestones from <Badge variant="outline">Beginner</Badge> to <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">Elite</Badge>. 
                    Each milestone has specific requirements and rewards.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Learning Paths</h4>
                  <p className="text-sm">
                    Choose from 3 learning paths based on your goals: 60-day Fast Track, 90-day Beginner to Pro, or 120-day Executive Excellence.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Track Progress</h4>
                  <p className="text-sm">
                    Visual progress bars show your advancement in XP, streaks, workouts, and challenges. 
                    Milestones unlock 2 levels before their target level.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Earn Rewards</h4>
                  <p className="text-sm">
                    Complete milestones to earn bonus XP, unlock premium features, gain XP multipliers, and collect exclusive badges. 
                    Reach Level 20 for the prestigious <strong>Pro Graduate</strong> badge!
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
              <p className="text-sm text-foreground">
                <strong>💡 Pro Tip:</strong> Focus on completing your current milestone first. 
                Consistency is key to progressing from beginner to professional level!
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>
            Got it, Let's Start!
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
