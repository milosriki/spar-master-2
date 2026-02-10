import { useState, useEffect, useCallback } from 'react';
import { GameState, Challenge, MicroWin, InventoryItem } from '@/types/gamification';

// Mock initial state - will be replaced with Supabase later
const INITIAL_GAME_STATE: GameState = {
  totalXP: 1250,
  level: 8,
  xpToNextLevel: 350,
  dailyXP: 85,
  weeklyXP: 420,
  // HP System
  currentHP: 50,
  maxHP: 50,
  // Currency
  gold: 25,
  gems: 2,
  // Character
  characterClass: 'warrior',
  equippedItems: {},
  inventory: [],
  // Energy
  currentEnergy: 7,
  maxEnergy: 10,
  lastEnergyRefill: new Date(),
  currentStreak: 12,
  bestStreak: 24,
  streakMultiplier: 1.5,
  streakFreezeCount: 2,
  lastStreakActivity: new Date(),
  workoutsCompleted: 47,
  challengesCompleted: 23,
  achievementsUnlocked: ['first_week', 'energy_master', 'streak_warrior'],
  rank: 15,
  leaderboardPosition: 15,
  friendsCount: 8
};

const STORAGE_KEY = 'sparkMasteryGameState';
const WORKOUT_XP_REWARD = 150;
const CHECKIN_XP_REWARD = 50;
const HABIT_COMPLETE_GOLD = 5;
const DEATH_GOLD_PENALTY = 0.5; // Lose 50% gold on death

const serializeGameState = (state: GameState) => ({
  ...state,
  lastEnergyRefill: state.lastEnergyRefill.toISOString(),
  lastStreakActivity: state.lastStreakActivity.toISOString()
});

const deserializeGameState = (stored: string | null): GameState => {
  if (!stored) return INITIAL_GAME_STATE;

  try {
    const parsed = JSON.parse(stored) as Partial<GameState>;
    return {
      ...INITIAL_GAME_STATE,
      ...parsed,
      lastEnergyRefill: parsed.lastEnergyRefill ? new Date(parsed.lastEnergyRefill) : INITIAL_GAME_STATE.lastEnergyRefill,
      lastStreakActivity: parsed.lastStreakActivity ? new Date(parsed.lastStreakActivity) : INITIAL_GAME_STATE.lastStreakActivity
    };
  } catch {
    return INITIAL_GAME_STATE;
  }
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window === 'undefined') {
      return INITIAL_GAME_STATE;
    }
    return deserializeGameState(localStorage.getItem(STORAGE_KEY));
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeGameState(gameState)));
  }, [gameState]);

  // Calculate level from XP
  const calculateLevel = useCallback((xp: number) => {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }, []);

  // Calculate XP needed for next level
  const calculateXPToNext = useCallback((level: number, currentXP: number) => {
    const nextLevelXP = Math.pow(level, 2) * 100;
    return nextLevelXP - currentXP;
  }, []);

  // Add XP and handle level ups
  const addXP = useCallback((amount: number, source: string) => {
    setGameState(prev => {
      const newTotalXP = prev.totalXP + amount;
      const newLevel = calculateLevel(newTotalXP);
      const leveledUp = newLevel > prev.level;
      
      if (leveledUp) {
        // Trigger level up celebration
        console.log(`🎉 Level up! Welcome to level ${newLevel}!`);
      }

      return {
        ...prev,
        totalXP: newTotalXP,
        level: newLevel,
        xpToNextLevel: calculateXPToNext(newLevel, newTotalXP),
        dailyXP: prev.dailyXP + amount,
        weeklyXP: prev.weeklyXP + amount,
        lastStreakActivity: new Date()
      };
    });
  }, [calculateLevel, calculateXPToNext]);

  // Update energy
  const updateEnergy = useCallback((amount: number) => {
    setGameState(prev => ({
      ...prev,
      currentEnergy: Math.max(0, Math.min(prev.maxEnergy, prev.currentEnergy + amount))
    }));
  }, []);

  // Complete challenge
  const completeChallenge = useCallback((challenge: Challenge) => {
    addXP(challenge.xpReward, 'challenge_completed');
    setGameState(prev => ({
      ...prev,
      challengesCompleted: prev.challengesCompleted + 1
    }));
  }, [addXP]);

  // Complete micro win
  const completeMicroWin = useCallback((microWin: MicroWin) => {
    addXP(microWin.xpReward, 'micro_win');
    updateEnergy(microWin.energyBoost);
  }, [addXP, updateEnergy]);

  // Update streak
  const updateStreak = useCallback(() => {
    setGameState(prev => {
      const now = new Date();
      const lastActivity = new Date(prev.lastStreakActivity);
      const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

      if (hoursSinceActivity >= 48) {
        return {
          ...prev,
          currentStreak: 1,
          streakMultiplier: 1.0,
          lastStreakActivity: now
        };
      }

      if (hoursSinceActivity >= 24) {
        const nextStreak = prev.currentStreak + 1;
        return {
          ...prev,
          currentStreak: nextStreak,
          bestStreak: Math.max(prev.bestStreak, nextStreak),
          streakMultiplier: Math.min(3.0, 1 + nextStreak * 0.1),
          lastStreakActivity: now
        };
      }

      return {
        ...prev,
        lastStreakActivity: now
      };
    });
  }, []);

  const logWorkout = useCallback(() => {
    addXP(WORKOUT_XP_REWARD, 'workout');
    setGameState(prev => ({
      ...prev,
      workoutsCompleted: prev.workoutsCompleted + 1
    }));
  }, [addXP]);

  const logDailyCheckIn = useCallback(() => {
    updateStreak();
    addXP(CHECKIN_XP_REWARD, 'daily_checkin');
  }, [addXP, updateStreak]);

  // Check if streak is at risk
  const isStreakAtRisk = useCallback(() => {
    const now = new Date();
    const lastActivity = new Date(gameState.lastStreakActivity);
    const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    return hoursSinceActivity > 20 && hoursSinceActivity < 24;
  }, [gameState.lastStreakActivity]);

  // Get energy status
  const getEnergyStatus = useCallback(() => {
    const { currentEnergy, maxEnergy } = gameState;
    const percentage = (currentEnergy / maxEnergy) * 100;
    
    if (percentage >= 70) return 'high';
    if (percentage >= 40) return 'medium';
    return 'low';
  }, [gameState]);

  // HP Management
  const updateHP = useCallback((amount: number) => {
    setGameState(prev => {
      const newHP = Math.max(0, Math.min(prev.maxHP, prev.currentHP + amount));
      
      // Death penalty: lose 50% gold, -1 level
      if (newHP <= 0) {
        console.log('💀 You have been defeated! Losing gold...');
        return {
          ...prev,
          currentHP: prev.maxHP, // Revive at full HP
          gold: Math.floor(prev.gold * (1 - DEATH_GOLD_PENALTY)),
          level: Math.max(1, prev.level - 1),
        };
      }

      return {
        ...prev,
        currentHP: newHP,
      };
    });
  }, []);

  // Currency Management
  const addGold = useCallback((amount: number) => {
    setGameState(prev => ({
      ...prev,
      gold: prev.gold + amount,
    }));
  }, []);

  const spendGold = useCallback((amount: number): boolean => {
    let success = false;
    setGameState(prev => {
      if (prev.gold >= amount) {
        success = true;
        return { ...prev, gold: prev.gold - amount };
      }
      return prev;
    });
    return success;
  }, []);

  const addGems = useCallback((amount: number) => {
    setGameState(prev => ({
      ...prev,
      gems: prev.gems + amount,
    }));
  }, []);

  const spendGems = useCallback((amount: number): boolean => {
    let success = false;
    setGameState(prev => {
      if (prev.gems >= amount) {
        success = true;
        return { ...prev, gems: prev.gems - amount };
      }
      return prev;
    });
    return success;
  }, []);

  // Purchase item
  const purchaseItem = useCallback((item: InventoryItem) => {
    const spend = item.currency === 'gold' ? spendGold : spendGems;
    if (spend(item.cost)) {
      setGameState(prev => ({
        ...prev,
        inventory: [...prev.inventory, item],
      }));
      return true;
    }
    return false;
  }, [spendGold, spendGems]);

  // Get HP status
  const getHPStatus = useCallback(() => {
    const { currentHP, maxHP } = gameState;
    const percentage = (currentHP / maxHP) * 100;
    if (percentage > 60) return 'healthy';
    if (percentage > 30) return 'warning';
    return 'critical';
  }, [gameState]);

  return {
    gameState,
    isLoading,
    addXP,
    updateEnergy,
    updateHP,
    addGold,
    spendGold,
    addGems,
    spendGems,
    purchaseItem,
    completeChallenge,
    completeMicroWin,
    updateStreak,
    logWorkout,
    logDailyCheckIn,
    isStreakAtRisk,
    getEnergyStatus,
    getHPStatus,
    HABIT_COMPLETE_GOLD,
  };
};
