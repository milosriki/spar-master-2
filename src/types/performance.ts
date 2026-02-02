// Coach-inspired Recovery and Performance Metrics Types

export interface RecoveryMetrics {
  id: string;
  userId: string;
  date: Date;
  
  // Heart Rate Variability
  hrv: number; // ms
  hrvScore: number; // 0-100
  
  // Sleep metrics
  sleepDuration: number; // hours
  sleepQuality: number; // 0-100
  deepSleepPercentage: number;
  remSleepPercentage: number;
  
  // Recovery scores
  recoveryScore: number; // 0-100
  readinessScore: number; // 0-100
  
  // Subjective measures
  energyLevel: number; // 1-10
  stressLevel: number; // 1-10
  musclesoreness: number; // 1-10
  mood: number; // 1-10
  
  notes?: string;
}

export interface PerformanceMetrics {
  // Training Load (CTL = Chronic Training Load, fitness)
  ctl: number;
  
  // Acute Training Load (ATL = fatigue)
  atl: number;
  
  // Training Stress Balance (TSB = form, ctl - atl)
  tsb: number;
  
  // Other metrics
  weeklyVolume: number; // minutes
  weeklyIntensity: number; // 0-100
  trainingImpulse: number; // TRIMP
}

export interface WorkoutSession {
  id: string;
  userId: string;
  date: Date;
  type: 'cardio' | 'strength' | 'flexibility' | 'mixed';
  
  // Basic metrics
  duration: number; // minutes
  intensity: number; // 0-100
  caloriesBurned?: number;
  
  // Execution quality (Coach-inspired)
  executionScore: number; // 0-100
  completionRate: number; // % of planned workout completed
  
  // Heart rate data
  avgHeartRate?: number;
  maxHeartRate?: number;
  heartRateZones?: HeartRateZoneTime[];
  
  // Power/pace data
  avgPower?: number;
  avgPace?: number;
  
  // Subjective ratings
  perceivedEffort: number; // RPE 1-10
  enjoyment: number; // 1-10
  
  notes?: string;
  tags?: string[];
}

export interface HeartRateZoneTime {
  zone: 1 | 2 | 3 | 4 | 5;
  minutes: number;
  percentage: number;
}

export interface NutritionLog {
  id: string;
  userId: string;
  date: Date;
  
  // Macros
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams
  
  // Hydration
  waterIntake: number; // ml
  
  // Meal timing
  meals: Meal[];
  
  // Quality scores
  nutritionScore: number; // 0-100
  alignmentWithGoals: number; // 0-100
  
  notes?: string;
}

export interface Meal {
  id: string;
  time: Date;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface DailyRecommendation {
  date: Date;
  recoveryScore: number;
  readinessScore: number;
  recommendedIntensity: 'rest' | 'easy' | 'moderate' | 'hard' | 'peak';
  reasoning: string;
  trainingTips: string[];
  nutritionTips: string[];
  recoveryTips: string[];
}

export interface TrainingCalendarDay {
  date: Date;
  planned: WorkoutSession | null;
  actual: WorkoutSession | null;
  recovery: RecoveryMetrics | null;
  recommendation: DailyRecommendation | null;
  notes?: string;
}

export interface PerformanceTrend {
  metric: string;
  data: { date: Date; value: number }[];
  trend: 'improving' | 'stable' | 'declining';
  percentageChange: number;
  timeframe: 'week' | 'month' | 'quarter' | 'year';
}

export interface PowerCurve {
  duration: number; // seconds
  power: number; // watts or normalized score
  date: Date;
  isPR: boolean; // Personal Record
}

export interface AthleteProfile {
  userId: string;
  
  // Zones
  heartRateZones: { min: number; max: number }[];
  powerZones?: { min: number; max: number }[];
  paceZones?: { min: number; max: number }[]; // min/km
  
  // Thresholds
  functionalThresholdPower?: number; // watts
  lactateThreshold?: number; // bpm
  vo2max?: number;
  restingHeartRate: number;
  maxHeartRate: number;
  
  // Body metrics
  weight: number; // kg
  height: number; // cm
  bodyFat?: number; // percentage
  
  // Goals
  trainingGoal: string;
  weeklyVolumeGoal: number; // minutes
  eventDate?: Date;
  
  updatedAt: Date;
}
