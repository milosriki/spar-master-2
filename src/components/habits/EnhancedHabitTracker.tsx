import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Habit, HabitType, TASK_COLOR_MAP, getTaskColor, DEFAULT_REWARDS } from '@/types/habits';
import {
  Plus, Check, X, Flame, Star, TrendingUp, TrendingDown,
  RotateCcw, Calendar, CheckSquare, Heart,
} from 'lucide-react';

interface EnhancedHabitTrackerProps {
  onHabitComplete: (habit: Habit) => void;
  onHabitMissed: (habit: Habit) => void;
  initialHabits?: Habit[];
  onHabitsChange?: (habits: Habit[]) => void;
}

// Mock habits data — will be replaced with Supabase
const MOCK_HABITS: Habit[] = [
  {
    id: 'welcome-1', 
    title: 'Welcome to Spark Mastery', 
    notes: 'This is your habit tracker. AI will fill this soon.',
    type: 'habit', 
    xpReward: 10, 
    goldReward: 0, 
    taskColor: 'neutral', 
    taskValue: 0,
    hpDamage: 0, 
    isCompleteToday: false, 
    streak: 0,
    completionHistory: [], 
    createdAt: new Date().toISOString(),
  }
];

export const EnhancedHabitTracker: React.FC<EnhancedHabitTrackerProps> = ({
  onHabitComplete,
  onHabitMissed,
  initialHabits,
  onHabitsChange,
}) => {
  const [habits, setHabits] = useState<Habit[]>(initialHabits || MOCK_HABITS);
  const [activeTab, setActiveTab] = useState<HabitType>('daily');

  // Sync changes to parent
  React.useEffect(() => {
    if (onHabitsChange) {
      onHabitsChange(habits);
    }
  }, [habits, onHabitsChange]);

  const filteredHabits = useMemo(
    () => habits.filter((h) => h.type === activeTab),
    [habits, activeTab]
  );

  const handleComplete = (habit: Habit) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habit.id
          ? {
              ...h,
              isCompleteToday: true,
              streak: h.streak + 1,
              taskValue: h.taskValue + 1,
              taskColor: getTaskColor(h.taskValue + 1),
              completionHistory: [...h.completionHistory, new Date().toISOString()],
            }
          : h
      )
    );
    onHabitComplete(habit);
  };

  const handleNegative = (habit: Habit) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habit.id
          ? {
              ...h,
              negativeCount: (h.negativeCount || 0) + 1,
              taskValue: h.taskValue - 1,
              taskColor: getTaskColor(h.taskValue - 1),
            }
          : h
      )
    );
    onHabitMissed(habit);
  };

  const completedCount = filteredHabits.filter((h) => h.isCompleteToday).length;
  const totalCount = filteredHabits.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-slate-700/50 backdrop-blur-xl shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            Habit Tracker
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              {completedCount}/{totalCount}
            </span>
            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as HabitType)}>
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700/30">
            <TabsTrigger value="habit" className="text-xs data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Habits
            </TabsTrigger>
            <TabsTrigger value="daily" className="text-xs data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              Dailies
            </TabsTrigger>
            <TabsTrigger value="todo" className="text-xs data-[state=active]:bg-slate-700 data-[state=active]:text-white">
              <CheckSquare className="w-3.5 h-3.5 mr-1" />
              To-Dos
            </TabsTrigger>
          </TabsList>

          {(['habit', 'daily', 'todo'] as HabitType[]).map((type) => (
            <TabsContent key={type} value={type} className="mt-3 space-y-2">
              {habits
                .filter((h) => h.type === type)
                .map((habit) => (
                  <HabitItem
                    key={habit.id}
                    habit={habit}
                    onComplete={handleComplete}
                    onNegative={handleNegative}
                  />
                ))}

              {habits.filter((h) => h.type === type).length === 0 && (
                <div className="text-center py-6 text-slate-500 text-sm">
                  No {type === 'todo' ? 'to-dos' : `${type}s`} yet. Add one to get started!
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Individual Habit Item Component
const HabitItem: React.FC<{
  habit: Habit;
  onComplete: (habit: Habit) => void;
  onNegative: (habit: Habit) => void;
}> = ({ habit, onComplete, onNegative }) => {
  const borderColor = TASK_COLOR_MAP[habit.taskColor];

  return (
    <div
      className="group flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border transition-all duration-200 hover:bg-slate-800/60 hover:shadow-md"
      style={{ borderColor: `${borderColor}40`, borderLeftWidth: '3px' }}
    >
      {/* Action buttons */}
      <div className="flex gap-1 shrink-0">
        {habit.type === 'habit' && (
          <button
            onClick={() => onComplete(habit)}
            className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/30 flex items-center justify-center transition-all duration-200 hover:scale-110"
            title="Positive"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
          </button>
        )}

        {habit.type === 'daily' && (
          <button
            onClick={() => !habit.isCompleteToday && onComplete(habit)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
              habit.isCompleteToday
                ? 'bg-emerald-500/30 border border-emerald-500/50'
                : 'bg-slate-700/50 border border-slate-600/30 hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:scale-110'
            }`}
            disabled={habit.isCompleteToday}
            title={habit.isCompleteToday ? 'Done!' : 'Complete'}
          >
            <Check className={`w-4 h-4 ${habit.isCompleteToday ? 'text-emerald-400' : 'text-slate-400'}`} />
          </button>
        )}

        {habit.type === 'todo' && (
          <button
            onClick={() => !habit.isCompleteToday && onComplete(habit)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
              habit.isCompleteToday
                ? 'bg-emerald-500/30 border border-emerald-500/50'
                : 'bg-slate-700/50 border border-slate-600/30 hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:scale-110'
            }`}
            disabled={habit.isCompleteToday}
          >
            <Check className={`w-4 h-4 ${habit.isCompleteToday ? 'text-emerald-400' : 'text-slate-400'}`} />
          </button>
        )}
      </div>

      {/* Habit info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${habit.isCompleteToday ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
          {habit.title}
        </p>
        {habit.notes && (
          <p className="text-xs text-slate-500 truncate mt-0.5">{habit.notes}</p>
        )}
      </div>

      {/* Rewards preview */}
      <div className="flex items-center gap-2 shrink-0">
        {habit.streak > 0 && habit.type !== 'todo' && (
          <Badge variant="outline" className="text-[10px] border-orange-500/20 text-orange-400 px-1.5 py-0">
            <Flame className="w-3 h-3 mr-0.5" />
            {habit.streak}
          </Badge>
        )}
        <span className="text-[10px] text-amber-400 font-mono">+{habit.goldReward}g</span>
        <span className="text-[10px] text-indigo-400 font-mono">+{habit.xpReward}xp</span>
      </div>

      {/* Negative button for habits */}
      {habit.type === 'habit' && (
        <button
          onClick={() => onNegative(habit)}
          className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-all duration-200 hover:scale-110 shrink-0"
          title="Negative"
        >
          <X className="w-4 h-4 text-red-400" />
        </button>
      )}

      {/* HP damage indicator for dailies */}
      {habit.type === 'daily' && !habit.isCompleteToday && habit.hpDamage > 0 && (
        <div className="shrink-0" title={`-${habit.hpDamage} HP if missed`}>
          <Heart className="w-3.5 h-3.5 text-red-400/50" />
        </div>
      )}
    </div>
  );
};

export default EnhancedHabitTracker;
