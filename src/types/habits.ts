// Habitica-inspired Habit Tracking Types

export type HabitType = 'habit' | 'daily' | 'todo';
export type HabitDifficulty = 'trivial' | 'easy' | 'medium' | 'hard';
export type HabitDirection = 'positive' | 'negative' | 'both';
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Habit {
  id: string;
  type: HabitType;
  title: string;
  notes?: string;
  difficulty: HabitDifficulty;
  
  // For 'habit' type
  direction?: HabitDirection;
  positiveCount?: number;
  negativeCount?: number;
  
  // For 'daily' type
  recurrence?: RecurrenceType;
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday)
  startDate?: Date;
  streak?: number;
  
  // For 'todo' type
  completed?: boolean;
  completedAt?: Date;
  dueDate?: Date;
  checklist?: ChecklistItem[];
  
  // Common fields
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  lastCompletedAt?: Date;
  category?: 'fitness' | 'wellness' | 'work' | 'social' | 'personal';
  xpValue: number;
  energyCost: number;
  
  // Habitica-inspired features
  goldReward: number;
  taskColor?: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';
  taskValue: number; // Internal value that affects color
  hpDamage?: number; // For missed dailies or negative habits
  isCompleteToday?: boolean; // For daily tracking
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface HabitStats {
  totalHabits: number;
  completedToday: number;
  currentStreaks: number;
  longestStreak: number;
  completionRate: number;
  xpEarnedFromHabits: number;
  habitsByCategory: Record<string, number>;
}

export interface HabitHistory {
  habitId: string;
  date: Date;
  type: 'completion' | 'positive' | 'negative' | 'miss';
  xpEarned: number;
  notes?: string;
}

// Difficulty multipliers for XP calculation
export const DIFFICULTY_MULTIPLIERS: Record<HabitDifficulty, number> = {
  trivial: 0.5,
  easy: 1,
  medium: 1.5,
  hard: 2
};

// Base XP values by habit type
export const BASE_XP_VALUES: Record<HabitType, number> = {
  habit: 10,
  daily: 20,
  todo: 15
};
