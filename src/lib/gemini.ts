import { supabase } from "@/integrations/supabase/client";
import { AIMessage, Challenge, GameState } from "@/types/gamification";

// ── Types ────────────────────────────────────────────────────────────

export interface TimeContext {
  localTime: string;       // e.g. "14:32"
  dayOfWeek: string;       // e.g. "Monday"
  hour: number;            // 0-23
  isFirstSessionToday: boolean;
  sessionNumber: number;
  hoursSinceLastVisit: number;
}

export interface HabitStatus {
  title: string;
  completed: boolean;
}

export interface ConversationTurn {
  role: 'user' | 'model';
  text: string;
}

// ── Time Context Builder ─────────────────────────────────────────────

export function buildTimeContext(): TimeContext {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const lastVisitStr = localStorage.getItem('spar_last_visit');
  const lastVisit = lastVisitStr ? new Date(lastVisitStr) : now;
  const hoursSince = Math.round((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60));

  const todayKey = now.toISOString().split('T')[0];
  const sessionKey = `spar_sessions_${todayKey}`;
  const sessionCount = parseInt(localStorage.getItem(sessionKey) || '0', 10) + 1;
  localStorage.setItem(sessionKey, sessionCount.toString());
  localStorage.setItem('spar_last_visit', now.toISOString());

  return {
    localTime: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
    dayOfWeek: days[now.getDay()],
    hour: now.getHours(),
    isFirstSessionToday: sessionCount === 1,
    sessionNumber: sessionCount,
    hoursSinceLastVisit: hoursSince,
  };
}

// ── Conversation History Builder ─────────────────────────────────────

export function buildConversationHistory(messages: AIMessage[], maxTurns = 8): ConversationTurn[] {
  return messages
    .slice(-maxTurns)
    .map(m => ({
      role: (m.sender === 'ai' ? 'model' : 'user') as 'user' | 'model',
      text: m.text,
    }));
}

// ── AI Message Counting (Paywall) ────────────────────────────────────

const MAX_FREE_MESSAGES = 3;
const PAYWALL_COOLDOWN_DAYS = 3;

export function getAIMessageCount(): number {
  const todayKey = new Date().toISOString().split('T')[0];
  return parseInt(localStorage.getItem(`spar_ai_msgs_${todayKey}`) || '0', 10);
}

function incrementAIMessageCount(): number {
  const todayKey = new Date().toISOString().split('T')[0];
  const key = `spar_ai_msgs_${todayKey}`;
  const count = parseInt(localStorage.getItem(key) || '0', 10) + 1;
  localStorage.setItem(key, count.toString());
  return count;
}

export function shouldShowPaywall(): boolean {
  const count = getAIMessageCount();
  if (count < MAX_FREE_MESSAGES) return false;

  // Check cooldown — if user dismissed within last 3 days, don't show again
  const dismissed = localStorage.getItem('spar_paywall_dismissed');
  if (dismissed) {
    const dismissedDate = new Date(dismissed);
    const daysSince = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < PAYWALL_COOLDOWN_DAYS) return false;
  }

  return true;
}

export function getMaxFreeMessages(): number {
  return MAX_FREE_MESSAGES;
}

// ── Main API Call ────────────────────────────────────────────────────

/**
 * Send a message to the AI Coach via the secure Edge Function proxy.
 * Now includes conversation history, habits, and time context for intelligent responses.
 * Returns '__PAYWALL__' if the user has exceeded daily free message limit.
 */
export async function sendMessageToGemini(
  message: string,
  gameState?: GameState,
  challenges?: Challenge[],
  conversationHistory?: ConversationTurn[],
  todaysHabits?: HabitStatus[],
  timeContext?: TimeContext,
): Promise<string> {
  // Check paywall before calling Edge Function
  if (shouldShowPaywall()) {
    return '__PAYWALL__';
  }

  try {
    const { data, error } = await supabase.functions.invoke('ai-coach', {
      body: {
        action: 'chat',
        message,
        gameState: gameState ? {
          level: gameState.level,
          totalXP: gameState.totalXP,
          currentStreak: gameState.currentStreak,
          currentEnergy: gameState.currentEnergy,
          maxEnergy: gameState.maxEnergy,
          characterClass: gameState.characterClass,
          gold: gameState.gold,
          gems: gameState.gems,
          currentHP: gameState.currentHP,
          maxHP: gameState.maxHP,
          workoutsCompleted: gameState.workoutsCompleted,
          bestStreak: gameState.bestStreak,
        } : undefined,
        challenges: challenges?.map(c => ({
          title: c.title,
          currentProgress: c.currentProgress,
          targetValue: c.targetValue,
          completedAt: c.completedAt,
        })),
        conversationHistory,
        todaysHabits,
        timeContext,
      },
    });

    if (error) {
      console.error("Edge function error:", error);
      return "I'm having trouble connecting to my AI brain right now. Please try again later.";
    }

    // Increment message count on successful response
    incrementAIMessageCount();

    return data?.data || "I'm having trouble generating a response. Please try again.";
  } catch (error) {
    console.error("Error communicating with AI Coach:", error);
    return "I'm having trouble connecting to my AI brain right now. Please try again later.";
  }
}

