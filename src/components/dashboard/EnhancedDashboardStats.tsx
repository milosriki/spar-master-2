import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GameState } from '@/types/gamification';
import { HabitStats } from '@/types/habits';
import {
  Activity, Target, Flame, Coins, TrendingUp,
  CheckCircle2, XCircle, BarChart3,
} from 'lucide-react';

interface EnhancedDashboardStatsProps {
  gameState: GameState;
  habitStats: HabitStats;
}

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subvalue?: string;
  color?: string;
}> = ({ icon, label, value, subvalue, color = 'text-white' }) => (
  <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-800/40 border border-slate-700/20">
    <div className="text-slate-400">{icon}</div>
    <span className={`text-xl font-bold ${color}`}>{value}</span>
    <span className="text-[10px] text-slate-500 uppercase tracking-wider text-center">{label}</span>
    {subvalue && <span className="text-[10px] text-slate-600">{subvalue}</span>}
  </div>
);

export const EnhancedDashboardStats: React.FC<EnhancedDashboardStatsProps> = ({
  gameState,
  habitStats,
}) => {
  const {
    workoutsCompleted, challengesCompleted, totalXP,
    currentStreak, bestStreak, dailyXP, gold,
  } = gameState;

  const totalTasksToday = habitStats.totalHabits + habitStats.totalDailies + habitStats.totalTodos;
  const completedToday = habitStats.habitsCompletedToday + habitStats.dailiesCompletedToday + habitStats.todosCompletedToday;
  const completionRate = totalTasksToday > 0 ? (completedToday / totalTasksToday) * 100 : 0;

  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-slate-700/50 backdrop-blur-xl shadow-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Today's Performance
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Completion Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300 font-medium">Daily Completion</span>
            <span className="text-sm font-mono text-slate-400">
              {completedToday}/{totalTasksToday} tasks
            </span>
          </div>
          <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                completionRate >= 80
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                  : completionRate >= 50
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : 'bg-gradient-to-r from-red-500 to-orange-400'
              }`}
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Habits: {habitStats.habitsCompletedToday}</span>
            <span>Dailies: {habitStats.dailiesCompletedToday}</span>
            <span>To-Dos: {habitStats.todosCompletedToday}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatCard
            icon={<Activity className="w-5 h-5" />}
            label="Workouts"
            value={workoutsCompleted}
            color="text-emerald-400"
          />
          <StatCard
            icon={<Target className="w-5 h-5" />}
            label="Challenges"
            value={challengesCompleted}
            color="text-blue-400"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Total XP"
            value={totalXP.toLocaleString()}
            subvalue={`+${dailyXP} today`}
            color="text-indigo-400"
          />
          <StatCard
            icon={<Flame className="w-5 h-5" />}
            label="Streak"
            value={`${currentStreak}d`}
            subvalue={`Best: ${bestStreak}d`}
            color="text-orange-400"
          />
        </div>

        {/* Today's Earnings */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500/5 to-amber-500/0 border border-amber-500/10">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-slate-300 font-medium">Gold Earned Today</span>
          </div>
          <span className="text-lg font-bold text-amber-400 font-mono">
            +{habitStats.goldEarnedToday}
          </span>
        </div>

        {/* Missed Tasks Warning */}
        {habitStats.missedDailies > 0 && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/5 border border-red-500/10">
            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-xs text-red-300">
              {habitStats.missedDailies} missed {habitStats.missedDailies === 1 ? 'daily' : 'dailies'} —{' '}
              <span className="text-red-400 font-medium">HP damage incoming!</span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedDashboardStats;
