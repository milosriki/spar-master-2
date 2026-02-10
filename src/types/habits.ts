// Spark Mastery — Habit System Types (Habitica-inspired)

export type TaskColor = 'worst' | 'bad' | 'neutral' | 'good' | 'better' | 'best';

export type HabitType = 'habit' | 'daily' | 'todo';

export interface Habit {
  id: string;
  title: string;
  notes?: string;
  type: HabitType;

  // Gamification
  xpReward: number;
  goldReward: number;
  taskColor: TaskColor;
  taskValue: number; // -47 to +21.27 (Habitica-style task value)
  hpDamage: number; // HP lost if daily is missed

  // Tracking
  isCompleteToday: boolean;
  streak: number;
  completionHistory: string[]; // ISO date strings
  createdAt: string;

  // Habit-specific (positive/negative clicks)
  positiveCount?: number;
  negativeCount?: number;

  // Daily-specific
  frequency?: 'daily' | 'weekdays' | 'weekends' | 'custom';
  customDays?: number[]; // 0-6, Sun-Sat

  // Todo-specific
  dueDate?: string;
  completed?: boolean;
  priority?: 'trivial' | 'easy' | 'medium' | 'hard';
}

export interface HabitStats {
  habitsCompletedToday: number;
  dailiesCompletedToday: number;
  todosCompletedToday: number;
  totalHabits: number;
  totalDailies: number;
  totalTodos: number;
  goldEarnedToday: number;
  xpEarnedToday: number;
  missedDailies: number;
}

// Map task value ranges to colors
export const getTaskColor = (value: number): TaskColor => {
  if (value < -20) return 'worst';
  if (value < -1) return 'bad';
  if (value < 1) return 'neutral';
  if (value < 5) return 'good';
  if (value < 10) return 'better';
  return 'best';
};

// CSS color mapping
export const TASK_COLOR_MAP: Record<TaskColor, string> = {
  worst: '#e74c3c',   // Deep red
  bad: '#f39c12',     // Orange
  neutral: '#f1c40f', // Yellow
  good: '#2ecc71',    // Green
  better: '#3498db',  // Blue
  best: '#9b59b6',    // Purple
};

// Default rewards by priority
export const DEFAULT_REWARDS: Record<string, { xp: number; gold: number }> = {
  trivial: { xp: 5, gold: 1 },
  easy: { xp: 10, gold: 2 },
  medium: { xp: 25, gold: 5 },
  hard: { xp: 50, gold: 10 },
};
