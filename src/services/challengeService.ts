import { Challenge } from '@/types/gamification';

const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: 'Energy Warrior',
    description: 'Maintain 8+ energy for 3 days',
    type: 'daily',
    category: 'energy',
    targetValue: 3,
    currentProgress: 0,
    xpReward: 500,
    isPremium: false,
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    title: 'Dubai Heat Beater',
    description: 'Complete 5 workouts before 7 AM',
    type: 'weekly',
    category: 'workout',
    targetValue: 5,
    currentProgress: 0,
    xpReward: 1000,
    isPremium: true,
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    title: 'Streak Master',
    description: 'Reach a 14-day streak',
    type: 'special',
    category: 'streak',
    targetValue: 14,
    currentProgress: 0,
    xpReward: 2000,
    isPremium: false,
    expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
  }
];

const CHALLENGE_STORAGE_KEY = 'sparkMasteryChallenges';
const ACCEPTED_STORAGE_KEY = 'sparkMasteryAcceptedChallenges';

export const ChallengeService = {
  getInitialChallenges: (): Challenge[] => {
    if (typeof window === 'undefined') return DEFAULT_CHALLENGES;
    
    const stored = localStorage.getItem(CHALLENGE_STORAGE_KEY);
    if (!stored) return DEFAULT_CHALLENGES;

    try {
      const parsed = JSON.parse(stored) as Challenge[];
      return parsed.map(challenge => ({
        ...challenge,
        expiresAt: new Date(challenge.expiresAt),
        completedAt: challenge.completedAt ? new Date(challenge.completedAt) : undefined
      }));
    } catch {
      return DEFAULT_CHALLENGES;
    }
  },

  getAcceptedChallengeIds: (): string[] => {
    if (typeof window === 'undefined') return ['1'];
    const stored = localStorage.getItem(ACCEPTED_STORAGE_KEY);
    if (!stored) return ['1'];
    try { return JSON.parse(stored) as string[]; } catch { return ['1']; }
  },

  saveChallenges: (challenges: Challenge[]) => {
    if (typeof window !== 'undefined') {
      const serialized = challenges.map(challenge => ({
        ...challenge,
        expiresAt: challenge.expiresAt.toISOString(),
        completedAt: challenge.completedAt ? challenge.completedAt.toISOString() : undefined
      }));
      localStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(serialized));
    }
  },

  saveAcceptedIds: (ids: string[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCEPTED_STORAGE_KEY, JSON.stringify(ids));
    }
  }
};
