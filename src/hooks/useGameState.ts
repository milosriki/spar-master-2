import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Challenge, MicroWin, InventoryItem, Habit } from '@/types/gamification';
import { ChallengeService } from '@/services/challengeService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Initial state fallback
const INITIAL_GAME_STATE: GameState = {
  totalXP: 0,
  level: 1,
  xpToNextLevel: 100,
  dailyXP: 0,
  weeklyXP: 0,
  currentHP: 50,
  maxHP: 50,
  gold: 0,
  gems: 0,
  characterClass: 'novice',
  equippedItems: {},
  inventory: [],
  currentEnergy: 10,
  maxEnergy: 10,
  lastEnergyRefill: new Date(),
  currentStreak: 0,
  bestStreak: 0,
  streakMultiplier: 1.0,
  streakFreezeCount: 0,
  lastStreakActivity: new Date(),
  workoutsCompleted: 0,
  challengesCompleted: 0,
  activeChallenges: [],
  acceptedChallengeIds: [],
  achievementsUnlocked: [],
  rank: 0,
  leaderboardPosition: 0,
  friendsCount: 0
};

const WORKOUT_XP_REWARD = 150;
const CHECKIN_XP_REWARD = 50;

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Refs for debouncing DB updates
  const energyTimeoutRef = useRef<NodeJS.Timeout>();
  const hpTimeoutRef = useRef<NodeJS.Timeout>();

  // Hydrate state from Supabase on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setIsLoading(false);
          return;
        }

        setUserId(session.user.id);
        
        // 1. Fetch profile stats
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        // 2. Fetch inventory
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory')
          .select('*')
          .eq('user_id', session.user.id);

        if (inventoryError) console.error('Error loading inventory:', inventoryError);

        // 3. (Optional) Fetch habits if we were storing them in state
        // For now, habits are managed by useSupabaseHabits, but we might want them here too.

        if (profile) {
          // Map inventory items
          const inventoryItems: InventoryItem[] = (inventoryData || []).map(item => ({
            id: item.item_id,
            name: item.item_id, // Placeholder until we have a catalog
            type: item.item_type as 'weapon' | 'armor' | 'consumable',
            rarity: 'common',
            description: 'Item',
            stats: {},
            isEquipped: item.is_equipped
          }));

          setGameState(prev => ({
            ...prev,
            level: profile.level || 1,
            totalXP: profile.total_xp || 0,
            currentStreak: profile.current_streak || 0,
            currentEnergy: profile.current_energy || 10,
            maxEnergy: profile.max_energy || 10,
            gold: profile.gold || 0,
            gems: profile.gems || 0,
            characterClass: profile.character_class as any || 'novice',
            achievementsUnlocked: profile.achievements || [],
            inventory: inventoryItems,
            // These would be distinct tables in a full implementation
            activeChallenges: ChallengeService.getInitialChallenges(), 
            acceptedChallengeIds: ChallengeService.getAcceptedChallengeIds()
          }));
        }
      } catch (error) {
        console.error('Error loading game state:', error);
        toast.error('Failed to load progress');
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, []);

  // Generic DB Update Helper
  const updateProfile = useCallback(async (updates: Partial<GameState>) => {
    if (!userId) return;
    
    // Map GameState keys to DB columns
    const dbUpdates: any = {};
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.totalXP !== undefined) dbUpdates.total_xp = updates.totalXP;
    if (updates.currentStreak !== undefined) dbUpdates.current_streak = updates.currentStreak;
    if (updates.currentEnergy !== undefined) dbUpdates.current_energy = updates.currentEnergy;
    if (updates.gold !== undefined) dbUpdates.gold = updates.gold;
    if (updates.gems !== undefined) dbUpdates.gems = updates.gems;
    if (updates.characterClass !== undefined) dbUpdates.character_class = updates.characterClass;
    
    if (Object.keys(dbUpdates).length === 0) return;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId);

    if (error) {
      console.error('Failed to save progress:', error);
    }
  }, [userId]);

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
      
      const newState = {
        ...prev,
        totalXP: newTotalXP,
        level: newLevel,
        xpToNextLevel: calculateXPToNext(newLevel, newTotalXP),
        dailyXP: prev.dailyXP + amount,
        weeklyXP: prev.weeklyXP + amount,
      };

      // Optimistic update
      if (leveledUp) {
        toast.success(`🎉 Level Up! You are now Level ${newLevel}!`);
      }
      
      // Async DB write
      updateProfile({ totalXP: newTotalXP, level: newLevel });
      
      return newState;
    });
  }, [calculateLevel, calculateXPToNext, updateProfile]);

  // Update energy (Debounced DB sync)
  const updateEnergy = useCallback((amount: number) => {
    setGameState(prev => {
      const newEnergy = Math.max(0, Math.min(prev.maxEnergy, prev.currentEnergy + amount));
      
      // Debounce DB update to prevent spam
      if (energyTimeoutRef.current) clearTimeout(energyTimeoutRef.current);
      energyTimeoutRef.current = setTimeout(() => {
        updateProfile({ currentEnergy: newEnergy });
      }, 1000);

      return { ...prev, currentEnergy: newEnergy };
    });
  }, [updateProfile]);

  // Update HP — with real death penalty (gold loss + HP reset)
  const updateHP = useCallback((amount: number) => {
    setGameState(prev => {
      const newHP = Math.max(0, Math.min(prev.maxHP, prev.currentHP + amount));

      // Death penalty — lose 10% of gold, reset HP to 50%
      if (newHP === 0 && prev.currentHP > 0) {
        const goldPenalty = Math.floor(prev.gold * 0.1);
        const resetHP = Math.floor(prev.maxHP * 0.5);
        toast.error(`💀 You fainted! Lost ${goldPenalty} gold. Complete your habits to stay alive!`);
        
        const newGold = Math.max(0, prev.gold - goldPenalty);
        updateProfile({ gold: newGold });
        return { ...prev, currentHP: resetHP, gold: newGold };
      }

      return { ...prev, currentHP: newHP };
    });
  }, [updateProfile]);

  // Update streak
  const updateStreak = useCallback(() => {
    setGameState(prev => {
      const now = new Date();
      // Simple daily logic for prototype
      const newStreak = prev.currentStreak + 1;
      updateProfile({ currentStreak: newStreak });
      return { ...prev, currentStreak: newStreak, lastStreakActivity: now };
    });
  }, [updateProfile]);

  // Simple Add Gold
  const addGold = useCallback((amount: number) => {
    setGameState(prev => {
      const newGold = prev.gold + amount;
      updateProfile({ gold: newGold });
      return { ...prev, gold: newGold };
    });
  }, [updateProfile]);

  // Purchase Item (Real DB Transaction)
  const purchaseItem = useCallback(async (item: InventoryItem) => {
    if (!userId) return false;
    
    // Check balance
    if (gameState.gold < (item.price || 0)) {
      toast.error("Not enough gold!");
      return false;
    }

    // 1. Optimistic Update
    const oldState = { ...gameState };
    setGameState(prev => ({
      ...prev,
      gold: prev.gold - (item.price || 0),
      inventory: [...prev.inventory, item]
    }));

    try {
      // 2. Insert into inventory table
      const { error: insertError } = await supabase
        .from('inventory')
        .insert({
          user_id: userId,
          item_id: item.id,
          item_type: item.type,
          is_equipped: false
        });

      if (insertError) throw insertError;

      // 3. Deduct gold
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ gold: gameState.gold - (item.price || 0) })
        .eq('id', userId);

      if (updateError) throw updateError;

      toast.success(`Purchased ${item.name}!`);
      return true;

    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('Purchase failed. Rolling back.');
      setGameState(oldState); // Rollback
      return false;
    }
  }, [userId, gameState.gold, gameState]);

  // Stub functions to maintain interface compatibility
  const acceptChallenge = useCallback((id: string) => {}, []);
  const updateChallengeProgress = useCallback((cat: any, amt: number) => {}, []);
  const completeChallenge = useCallback((c: Challenge) => {
    addXP(c.xpReward, 'challenge');
  }, [addXP]);
  const completeMicroWin = useCallback((w: MicroWin) => {
     addXP(w.xpReward, 'microwin');
     updateEnergy(w.energyBoost);
  }, [addXP, updateEnergy]);
  const logWorkout = useCallback(() => {
    addXP(WORKOUT_XP_REWARD, 'workout');
  }, [addXP]);
  const logDailyCheckIn = useCallback(() => {
    updateStreak();
    addXP(CHECKIN_XP_REWARD, 'checkin');
  }, [updateStreak, addXP]);

  // Read-only helpers
  const isStreakAtRisk = useCallback(() => {
    if (!gameState.lastStreakActivity) return false;
    const hoursSince = (Date.now() - new Date(gameState.lastStreakActivity).getTime()) / (1000 * 60 * 60);
    return hoursSince > 20; // At risk if 20+ hours since last activity
  }, [gameState.lastStreakActivity]);

  const getEnergyStatus = useCallback(() => {
    const ratio = gameState.currentEnergy / gameState.maxEnergy;
    if (ratio <= 0.2) return 'depleted';
    if (ratio <= 0.5) return 'low';
    return 'high';
  }, [gameState.currentEnergy, gameState.maxEnergy]);

  const getHPStatus = useCallback(() => {
    const ratio = gameState.currentHP / gameState.maxHP;
    if (ratio <= 0.25) return 'critical';
    if (ratio <= 0.5) return 'low';
    return 'healthy';
  }, [gameState.currentHP, gameState.maxHP]);

  const spendGold = useCallback((amt: number) => {
    if (gameState.gold < amt) return false;
    const newGold = gameState.gold - amt;
    setGameState(prev => ({ ...prev, gold: newGold }));
    updateProfile({ gold: newGold });
    return true;
  }, [gameState.gold, updateProfile]);

  const addGems = useCallback((amt: number) => {
    setGameState(prev => ({ ...prev, gems: prev.gems + amt }));
  }, []);
  const spendGems = useCallback((amt: number) => {
    if (gameState.gems < amt) return false;
    setGameState(prev => ({ ...prev, gems: prev.gems - amt }));
    return true;
  }, [gameState.gems]);


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
    acceptChallenge,
    updateChallengeProgress,
    completeChallenge,
    completeMicroWin,
    updateStreak,
    logWorkout,
    logDailyCheckIn,
    isStreakAtRisk,
    getEnergyStatus,
    getHPStatus,
    HABIT_COMPLETE_GOLD: 5,
  };
};
