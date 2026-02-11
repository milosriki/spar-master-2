import { useState, useCallback, useRef } from 'react';
import { sendMessageToGemini, buildTimeContext, ConversationTurn, HabitStatus } from '@/lib/gemini';
import type { GameState, Challenge } from '@/types/gamification';

interface UseAICoachOptions {
  gameState?: GameState;
  challenges?: Challenge[];
  todaysHabits?: HabitStatus[];
}

interface UseAICoachReturn {
  sendMessage: (message: string) => Promise<string>;
  conversationHistory: ConversationTurn[];
  isLoading: boolean;
  error: string | null;
  clearHistory: () => void;
  triggerProactive: () => Promise<string | null>;
}

export function useAICoach({ gameState, challenges, todaysHabits }: UseAICoachOptions = {}): UseAICoachReturn {
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const historyRef = useRef<ConversationTurn[]>([]);

  const sendMessage = useCallback(async (message: string): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const timeContext = buildTimeContext();

      const response = await sendMessageToGemini(
        message,
        gameState,
        challenges,
        historyRef.current.slice(-8), // Last 8 turns for context
        todaysHabits || [],
        timeContext,
      );

      // Update conversation history
      const newHistory: ConversationTurn[] = [
        ...historyRef.current,
        { role: 'user', text: message },
        { role: 'model', text: response },
      ];

      // Keep last 20 turns max
      const trimmed = newHistory.slice(-20);
      historyRef.current = trimmed;
      setConversationHistory(trimmed);

      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get AI response';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [gameState, challenges, todaysHabits]);

  const clearHistory = useCallback(() => {
    historyRef.current = [];
    setConversationHistory([]);
  }, []);

  // Proactive coaching: generates a trigger message based on user state
  const triggerProactive = useCallback(async (): Promise<string | null> => {
    if (!gameState) return null;

    const streak = gameState.currentStreak || 0;
    const energy = gameState.currentEnergy || 0;
    const maxEnergy = gameState.maxEnergy || 10;

    // Determine if proactive trigger should fire
    let proactivePrompt: string | null = null;

    if (streak > 0 && streak < 3 && energy < maxEnergy * 0.4) {
      proactivePrompt = "I noticed my streak might be at risk today. What's one small thing I can do right now?";
    } else if ([7, 14, 30, 60, 100].includes(streak)) {
      proactivePrompt = `I just hit a ${streak}-day streak! How should I celebrate and push further?`;
    } else {
      const timeCtx = buildTimeContext();
      if (timeCtx.hoursSinceLastVisit > 48) {
        proactivePrompt = "I've been away for a while. Help me get back on track.";
      }
    }

    if (!proactivePrompt) return null;

    try {
      return await sendMessage(proactivePrompt);
    } catch {
      return null;
    }
  }, [gameState, sendMessage]);

  return {
    sendMessage,
    conversationHistory,
    isLoading,
    error,
    clearHistory,
    triggerProactive,
  };
}
