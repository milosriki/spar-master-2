import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Trophy,
  CheckCircle2,
  XCircle,
  Coins,
  Zap,
  Flame,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HabitStats } from '@/types/gamification';

interface EnhancedDashboardStatsProps {
  stats: {
    workoutsCompleted: number;
    challengesCompleted: number;
    totalXP: number;
    currentStreak: number;
  };
  habitStats?: HabitStats;
  className?: string;
}

export const EnhancedDashboardStats: React.FC<EnhancedDashboardStatsProps> = ({
  stats,
  habitStats,
  className
}) => {
  const mainStatCards = [
    {
      title: 'Workouts',
      value: stats.workoutsCompleted,
      icon: TrendingUp,
      color: 'text-energy-high',
      bg: 'bg-gradient-success'
    },
    {
      title: 'Challenges',
      value: stats.challengesCompleted,
      icon: Target,
      color: 'text-primary',
      bg: 'bg-gradient-primary'
    },
    {
      title: 'Total XP',
      value: stats.totalXP.toLocaleString(),
      icon: Trophy,
      color: 'text-xp',
      bg: 'bg-gradient-xp'
    },
    {
      title: 'Day Streak',
      value: stats.currentStreak,
      icon: Flame,
      color: 'text-streak',
      bg: 'bg-gradient-primary'
    }
  ];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {mainStatCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', stat.bg)}>
                    <Icon className={cn('h-5 w-5', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Habit Statistics */}
      {habitStats && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5" />
              Today's Habit Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Tasks</p>
                  <p className="text-xl font-bold">{habitStats.totalTasks}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="text-xl font-bold text-green-600">{habitStats.completedToday}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Missed</p>
                  <p className="text-xl font-bold text-red-600">{habitStats.missedToday}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-950">
                  <Coins className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Gold Earned</p>
                  <p className="text-xl font-bold text-yellow-600">{habitStats.totalGoldEarned}</p>
                </div>
              </div>
            </div>

            {/* Task Breakdown */}
            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
              <div className="text-center">
                <Badge variant="outline" className="mb-1">Habits</Badge>
                <p className="text-2xl font-bold">{habitStats.habitsCount}</p>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="mb-1">Dailies</Badge>
                <p className="text-2xl font-bold">{habitStats.dailiesCount}</p>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="mb-1">To-Dos</Badge>
                <p className="text-2xl font-bold">{habitStats.todosCount}</p>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Completion Rate</span>
                <span className="text-sm font-bold">
                  {habitStats.totalTasks > 0 
                    ? Math.round((habitStats.completedToday / habitStats.totalTasks) * 100)
                    : 0}%
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                  style={{ 
                    width: `${habitStats.totalTasks > 0 
                      ? (habitStats.completedToday / habitStats.totalTasks) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
