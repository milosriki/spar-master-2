import { supabase } from "@/integrations/supabase/client";

export interface AIHabitPlan {
  daily: { title: string; notes: string; xp: number }[];
  habits: { title: string; notes: string; xp: number }[];
  todos: { title: string; notes: string; xp: number }[];
  coachMessage: string;
}

export const AICoachService = {
  /**
   * Generates a personalized habit plan via the secure Edge Function proxy.
   * The Gemini API key never leaves the server.
   */
  async generateHabitPlan(goal: string, ageRange?: string): Promise<AIHabitPlan> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          action: 'generate-plan',
          goal,
          ageRange,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        return getFallbackPlan();
      }

      if (data?.data) {
        return data.data as AIHabitPlan;
      }

      // If the edge function couldn't parse the AI response
      if (data?.error) {
        console.warn("AI response parse error:", data.error);
      }

      return getFallbackPlan();
    } catch (error) {
      console.error("AI Generation Failed:", error);
      return getFallbackPlan();
    }
  },

  /**
   * Analyzes streak to return a motivational message.
   */
  getStreakMessage(streak: number): string {
    if (streak >= 30) return "🔥 UNSTOPPABLE! You're forging a new identity!";
    if (streak >= 14) return "⚔️ 2 Weeks Strong! You're a warrior.";
    if (streak >= 7) return "⚡ One Week down! The momentum is building.";
    if (streak >= 3) return "🚀 Liftoff! Keep this chain alive.";
    return "💡 Every legend starts with Day 1.";
  },

  /**
   * Multi-signal booking readiness scoring.
   * Replaces the binary shouldTriggerBooking with a nuanced system
   * that considers multiple engagement signals before suggesting PT.
   * 
   * Sales Psychology: Lead scoring — don't push until multiple signals
   * indicate the user is genuinely ready and invested.
   */
  getBookingReadiness(
    level: number,
    streak: number,
    messageCount: number = 0,
    habitsCompletedToday: number = 0,
    workoutsCompleted: number = 0,
    gold: number = 0,
    sessionCount: number = 1,
  ): { ready: boolean; score: number; nudgeType: 'none' | 'soft' | 'medium' | 'direct'; reason: string } {
    let score = 0;
    const reasons: string[] = [];

    // Level commitment (max 25)
    if (level >= 5) { score += 20; reasons.push(`Level ${level}`); }
    if (level >= 10) { score += 5; }

    // Streak consistency (max 25)
    if (streak >= 7) { score += 15; reasons.push(`${streak}-day streak`); }
    if (streak >= 14) { score += 10; }

    // AI Coach engagement (max 15)
    if (messageCount >= 10) { score += 15; reasons.push('10+ AI conversations'); }
    else if (messageCount >= 5) { score += 8; }

    // Today's activity (max 10)
    if (habitsCompletedToday >= 3) { score += 10; reasons.push('Active today'); }
    else if (habitsCompletedToday >= 1) { score += 5; }

    // Workout history (max 15)
    if (workoutsCompleted >= 5) { score += 15; reasons.push(`${workoutsCompleted} workouts done`); }
    else if (workoutsCompleted >= 2) { score += 8; }

    // Financial investment (max 10)
    if (gold > 200) { score += 10; reasons.push('Invested in rewards'); }
    else if (gold > 50) { score += 5; }

    // Clamp to 100
    score = Math.min(score, 100);

    // Determine nudge type based on score
    let nudgeType: 'none' | 'soft' | 'medium' | 'direct';
    if (score < 30) nudgeType = 'none';
    else if (score < 50) nudgeType = 'soft';
    else if (score < 70) nudgeType = 'medium';
    else nudgeType = 'direct';

    return {
      ready: score >= 30,
      score,
      nudgeType,
      reason: reasons.length > 0 ? reasons.join(', ') : 'Just getting started',
    };
  },

  /**
   * Legacy compatibility — wraps the new scoring system.
   */
  shouldTriggerBooking(level: number, streak: number): boolean {
    return this.getBookingReadiness(level, streak).ready;
  }
};

// Fallback if AI fails
function getFallbackPlan(): AIHabitPlan {
  return {
    daily: [
      { title: "Drink 2L Water", notes: "Hydration is key for energy.", xp: 10 },
      { title: "15 Min Movement", notes: "Walk, stretch, or workout.", xp: 20 }
    ],
    habits: [
      { title: "No Sugar after 8PM", notes: "Improve sleep quality.", xp: 15 }
    ],
    todos: [
      { title: "Clear Your Workspace", notes: "Set up for success.", xp: 30 }
    ],
    coachMessage: "Systems update complete. Let's build some momentum!"
  };
}
