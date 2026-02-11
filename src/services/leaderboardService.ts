import { LeaderboardEntry } from "@/types/gamification";
import { supabase } from "@/integrations/supabase/client";

export const LeaderboardService = {
  /**
   * Fetches the global leaderboard from Supabase.
   * Orders by total_xp descending.
   */
  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, location, total_xp, current_streak, level, avatar_url')
      .order('total_xp', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return data.map((profile, index) => ({
      userId: profile.id,
      name: `${profile.first_name || 'Gladiator'} ${profile.last_name?.charAt(0) || ''}.`,
      location: profile.location || 'Dubai',
      points: profile.total_xp || 0,
      rank: index + 1,
      streak: profile.current_streak || 0,
      level: profile.level || 1,
      avatar: profile.avatar_url || '👤'
    }));
  },

  /**
   * Merges the current user's state into the leaderboard.
   * Ensures the user sees where they stand relative to others.
   */
  getLeaderboardWithUser: async (currentUser: Partial<LeaderboardEntry>): Promise<LeaderboardEntry[]> => {
    // 1. Get Top 50
    const global = await LeaderboardService.getLeaderboard();
    
    // 2. Check if current user is already in the list
    const existingIndex = global.findIndex(p => p.userId === currentUser.userId);

    if (existingIndex !== -1) {
      // User is in top 50, just mark them
      global[existingIndex].isCurrentUser = true;
      return global;
    }

    // 3. If not in top 50, append them at the bottom with their hypothetical rank
    // In a real app we'd query `count(*)` where xp > user_xp to get exact rank
    if (currentUser.userId) {
      const userEntry: LeaderboardEntry = {
        userId: currentUser.userId,
        name: currentUser.name || 'You',
        location: currentUser.location || 'Dubai',
        points: currentUser.points || 0,
        rank: 999, // Placeholder for "outside top 50"
        streak: currentUser.streak || 0,
        level: currentUser.level || 1,
        avatar: currentUser.avatar || '👤',
        isCurrentUser: true
      };
      return [...global, userEntry];
    }

    return global;
  }
};
