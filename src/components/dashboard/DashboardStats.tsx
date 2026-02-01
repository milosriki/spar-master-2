import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Calendar, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardStatsProps {
  stats: {
    workoutsCompleted: number;
    challengesCompleted: number;
    totalXP: number;
    currentStreak: number;
  };
  className?: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  className
}) => {
  const statCards = [
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
      icon: Calendar,
      color: 'text-streak',
      bg: 'bg-gradient-primary'
    }
  ];

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      {statCards.map((stat) => {
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
  );
};