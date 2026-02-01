// Progress Roadmap Types - Help users advance from beginner to pro level

export interface ProgressMilestone {
  id: string;
  level: number;
  title: string;
  description: string;
  category: 'beginner' | 'intermediate' | 'advanced' | 'professional' | 'elite';
  requirements: MilestoneRequirement[];
  rewards: MilestoneReward[];
  isUnlocked: boolean;
  isCompleted: boolean;
  progressPercentage: number;
}

export interface MilestoneRequirement {
  id: string;
  type: 'xp' | 'streak' | 'challenges' | 'workouts' | 'energy' | 'social';
  description: string;
  target: number;
  current: number;
  isCompleted: boolean;
}

export interface MilestoneReward {
  type: 'xp' | 'energy' | 'feature' | 'badge' | 'multiplier';
  value: number | string;
  description: string;
}

export interface SkillArea {
  id: string;
  name: string;
  icon: string;
  level: number;
  maxLevel: number;
  xp: number;
  xpToNextLevel: number;
  description: string;
  benefits: string[];
  unlocks: string[]; // Features or content unlocked at each level (e.g., "Advanced Analytics", "Premium Challenges")
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  milestones: ProgressMilestone[];
  skillsImproved: string[];
  estimatedTimeToComplete: number; // in days
}

export interface UserProgress {
  overallLevel: number;
  overallProgress: number;
  currentPath: LearningPath | null;
  completedMilestones: string[];
  skillAreas: SkillArea[];
  nextMilestone: ProgressMilestone | null;
  recommendedActions: string[];
}
