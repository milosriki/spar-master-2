import { ProgressMilestone, LearningPath } from '@/types/progressRoadmap';

// Define the progression milestones from beginner to pro/elite level
export const PROGRESS_MILESTONES: ProgressMilestone[] = [
  // BEGINNER LEVEL (Levels 1-5)
  {
    id: 'beginner-start',
    level: 1,
    title: 'Energy Awakening',
    description: 'Begin your transformation journey',
    category: 'beginner',
    requirements: [
      { id: 'req-1', type: 'xp', description: 'Earn 100 XP', target: 100, current: 0, isCompleted: false },
      { id: 'req-2', type: 'workouts', description: 'Complete 3 workouts', target: 3, current: 0, isCompleted: false },
      { id: 'req-3', type: 'energy', description: 'Maintain 5+ energy for 1 day', target: 1, current: 0, isCompleted: false }
    ],
    rewards: [
      { type: 'xp', value: 200, description: '+200 Bonus XP' },
      { type: 'feature', value: 'AI Coach Basic', description: 'Unlock AI Coach' },
      { type: 'badge', value: 'First Steps', description: 'First Steps Badge' }
    ],
    isUnlocked: true,
    isCompleted: false,
    progressPercentage: 0
  },
  {
    id: 'beginner-foundation',
    level: 3,
    title: 'Building Momentum',
    description: 'Establish consistent energy habits',
    category: 'beginner',
    requirements: [
      { id: 'req-4', type: 'xp', description: 'Reach Level 3', target: 900, current: 0, isCompleted: false },
      { id: 'req-5', type: 'streak', description: 'Build a 5-day streak', target: 5, current: 0, isCompleted: false },
      { id: 'req-6', type: 'challenges', description: 'Complete 5 challenges', target: 5, current: 0, isCompleted: false }
    ],
    rewards: [
      { type: 'xp', value: 500, description: '+500 Bonus XP' },
      { type: 'multiplier', value: 1.2, description: '1.2x XP Multiplier' },
      { type: 'badge', value: 'Momentum Builder', description: 'Momentum Builder Badge' }
    ],
    isUnlocked: false,
    isCompleted: false,
    progressPercentage: 0
  },
  
  // INTERMEDIATE LEVEL (Levels 6-12)
  {
    id: 'intermediate-discipline',
    level: 6,
    title: 'Energy Discipline',
    description: 'Master consistent energy management',
    category: 'intermediate',
    requirements: [
      { id: 'req-7', type: 'xp', description: 'Reach Level 6', target: 3600, current: 0, isCompleted: false },
      { id: 'req-8', type: 'streak', description: 'Maintain 10-day streak', target: 10, current: 0, isCompleted: false },
      { id: 'req-9', type: 'workouts', description: 'Complete 20 workouts', target: 20, current: 0, isCompleted: false },
      { id: 'req-10', type: 'energy', description: 'Maintain 7+ energy for 5 days', target: 5, current: 0, isCompleted: false }
    ],
    rewards: [
      { type: 'xp', value: 1000, description: '+1000 Bonus XP' },
      { type: 'feature', value: 'Advanced Analytics', description: 'Unlock Advanced Analytics' },
      { type: 'badge', value: 'Energy Master', description: 'Energy Master Badge' }
    ],
    isUnlocked: false,
    isCompleted: false,
    progressPercentage: 0
  },
  {
    id: 'intermediate-consistency',
    level: 10,
    title: 'Consistency Champion',
    description: 'Prove your commitment to excellence',
    category: 'intermediate',
    requirements: [
      { id: 'req-11', type: 'xp', description: 'Reach Level 10', target: 10000, current: 0, isCompleted: false },
      { id: 'req-12', type: 'streak', description: 'Achieve 21-day streak', target: 21, current: 0, isCompleted: false },
      { id: 'req-13', type: 'challenges', description: 'Complete 20 challenges', target: 20, current: 0, isCompleted: false },
      { id: 'req-14', type: 'social', description: 'Connect with 5 friends', target: 5, current: 0, isCompleted: false }
    ],
    rewards: [
      { type: 'xp', value: 2000, description: '+2000 Bonus XP' },
      { type: 'multiplier', value: 1.5, description: '1.5x XP Multiplier' },
      { type: 'badge', value: 'Consistency King', description: 'Consistency King Badge' }
    ],
    isUnlocked: false,
    isCompleted: false,
    progressPercentage: 0
  },
  
  // ADVANCED LEVEL (Levels 13-20)
  {
    id: 'advanced-warrior',
    level: 15,
    title: 'Energy Warrior',
    description: 'Join the elite ranks of high performers',
    category: 'advanced',
    requirements: [
      { id: 'req-15', type: 'xp', description: 'Reach Level 15', target: 22500, current: 0, isCompleted: false },
      { id: 'req-16', type: 'streak', description: 'Achieve 30-day streak', target: 30, current: 0, isCompleted: false },
      { id: 'req-17', type: 'workouts', description: 'Complete 50 workouts', target: 50, current: 0, isCompleted: false },
      { id: 'req-18', type: 'challenges', description: 'Complete 30 challenges', target: 30, current: 0, isCompleted: false },
      { id: 'req-19', type: 'energy', description: 'Maintain 8+ energy for 14 days', target: 14, current: 0, isCompleted: false }
    ],
    rewards: [
      { type: 'xp', value: 5000, description: '+5000 Bonus XP' },
      { type: 'feature', value: 'Premium AI Coach', description: 'Unlock Premium AI Features' },
      { type: 'badge', value: 'Energy Warrior', description: 'Energy Warrior Badge' }
    ],
    isUnlocked: false,
    isCompleted: false,
    progressPercentage: 0
  },
  
  // PROFESSIONAL LEVEL (Levels 21-30)
  {
    id: 'professional-master',
    level: 20,
    title: 'Professional Mastery',
    description: 'Become a true professional in energy management',
    category: 'professional',
    requirements: [
      { id: 'req-20', type: 'xp', description: 'Reach Level 20', target: 40000, current: 0, isCompleted: false },
      { id: 'req-21', type: 'streak', description: 'Achieve 60-day streak', target: 60, current: 0, isCompleted: false },
      { id: 'req-22', type: 'workouts', description: 'Complete 100 workouts', target: 100, current: 0, isCompleted: false },
      { id: 'req-23', type: 'challenges', description: 'Complete 50 challenges', target: 50, current: 0, isCompleted: false },
      { id: 'req-24', type: 'social', description: 'Reach Top 10 on leaderboard', target: 10, current: 0, isCompleted: false }
    ],
    rewards: [
      { type: 'xp', value: 10000, description: '+10000 Bonus XP' },
      { type: 'multiplier', value: 2.0, description: '2x XP Multiplier' },
      { type: 'badge', value: 'Pro Graduate', description: 'Pro Graduate Badge' },
      { type: 'feature', value: 'Mentor Access', description: 'Unlock Mentorship Features' }
    ],
    isUnlocked: false,
    isCompleted: false,
    progressPercentage: 0
  },
  
  // ELITE LEVEL (Level 25+)
  {
    id: 'elite-legend',
    level: 25,
    title: 'Elite Legend',
    description: 'Join the legendary elite circle',
    category: 'elite',
    requirements: [
      { id: 'req-25', type: 'xp', description: 'Reach Level 25', target: 62500, current: 0, isCompleted: false },
      { id: 'req-26', type: 'streak', description: 'Achieve 100-day streak', target: 100, current: 0, isCompleted: false },
      { id: 'req-27', type: 'workouts', description: 'Complete 150 workouts', target: 150, current: 0, isCompleted: false },
      { id: 'req-28', type: 'challenges', description: 'Complete 75 challenges', target: 75, current: 0, isCompleted: false },
      { id: 'req-29', type: 'social', description: 'Reach #1 on leaderboard', target: 1, current: 0, isCompleted: false }
    ],
    rewards: [
      { type: 'xp', value: 20000, description: '+20000 Bonus XP' },
      { type: 'multiplier', value: 3.0, description: '3x XP Multiplier' },
      { type: 'badge', value: 'Elite Legend', description: 'Elite Legend Badge' },
      { type: 'feature', value: 'All Premium Features', description: 'Lifetime Premium Access' }
    ],
    isUnlocked: false,
    isCompleted: false,
    progressPercentage: 0
  }
];

// Define learning paths to help users progress systematically
export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'beginner-to-pro',
    title: 'Beginner to Professional',
    description: 'Complete progression path from day one to professional level',
    duration: '90 days',
    difficulty: 'beginner',
    milestones: PROGRESS_MILESTONES.filter(m => 
      m.category === 'beginner' || m.category === 'intermediate' || m.category === 'professional'
    ),
    skillsImproved: ['Energy Management', 'Consistency', 'Discipline', 'Fitness', 'Mental Resilience'],
    estimatedTimeToComplete: 90
  },
  {
    id: 'fast-track-elite',
    title: 'Fast Track to Elite',
    description: 'Accelerated path for ambitious high-achievers',
    duration: '60 days',
    difficulty: 'advanced',
    milestones: PROGRESS_MILESTONES,
    skillsImproved: ['Peak Performance', 'Leadership', 'Excellence', 'Mastery', 'Elite Mindset'],
    estimatedTimeToComplete: 60
  },
  {
    id: 'executive-excellence',
    title: 'Executive Excellence',
    description: 'Tailored path for busy executives in Dubai',
    duration: '120 days',
    difficulty: 'intermediate',
    milestones: PROGRESS_MILESTONES,
    skillsImproved: ['Energy Optimization', 'Work-Life Balance', 'Stress Management', 'Peak Performance'],
    estimatedTimeToComplete: 120
  }
];
