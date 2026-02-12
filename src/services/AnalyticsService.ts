import { supabase } from "@/integrations/supabase/client";

// ── Analytics Event Types ────────────────────────────────────────────

export type FunnelStage =
  | 'app_open'
  | 'onboard_start'
  | 'onboard_complete'
  | 'habit_create'
  | 'habit_complete'
  | 'ai_message_sent'
  | 'ai_message_received'
  | 'paywall_shown'
  | 'paywall_dismissed'
  | 'paywall_converted'
  | 'booking_modal_open'
  | 'booking_click'
  | 'booking_complete'
  | 'shop_open'
  | 'shop_purchase'
  | 'level_up'
  | 'streak_milestone'
  | 'referral_code_generated'
  | 'referral_captured'
  | 'referral_shared'
  | 'notification_permission_granted'
  | 'notification_permission_denied';

export interface AnalyticsEvent {
  event: FunnelStage;
  properties?: Record<string, string | number | boolean>;
  timestamp?: string;
}

// ── Analytics Service ────────────────────────────────────────────────

class AnalyticsService {
  private queue: AnalyticsEvent[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly FLUSH_INTERVAL_MS = 5000;
  private readonly MAX_QUEUE_SIZE = 20;

  /**
   * Track a funnel event. Events are batched and flushed to Supabase
   * periodically to minimize DB round-trips.
   */
  track(event: FunnelStage, properties?: Record<string, string | number | boolean>): void {
    this.queue.push({
      event,
      properties,
      timestamp: new Date().toISOString(),
    });

    // Flush if queue is full
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      this.flush();
      return;
    }

    // Set up debounced flush
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), this.FLUSH_INTERVAL_MS);
    }
  }

  /**
   * Flush all queued events to Supabase analytics_events table.
   */
  async flush(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;

      // Also persist to localStorage for client-side aggregation
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `spar_analytics_${today}`;
      const existing = JSON.parse(localStorage.getItem(storageKey) || '{}');

      for (const evt of events) {
        existing[evt.event] = (existing[evt.event] || 0) + 1;
      }
      localStorage.setItem(storageKey, JSON.stringify(existing));

      // Batch insert to Supabase analytics_events table
      if (userId) {
        const analyticsRows = events.map(evt => ({
          user_id: userId,
          event_name: evt.event,
          properties: evt.properties || {},
        }));

        await supabase
          .from('analytics_events')
          .insert(analyticsRows as never[])
          .then(() => {})
          .catch(e => console.error('Analytics flush error (non-fatal):', e));
      }
    } catch (e) {
      console.error('Analytics flush exception:', e);
      // Put events back in queue for retry
      this.queue = [...events, ...this.queue].slice(0, this.MAX_QUEUE_SIZE * 2);
    }
  }

  /**
   * Get today's event counts from localStorage (fast, no DB call).
   */
  getTodayCounts(): Record<string, number> {
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `spar_analytics_${today}`;
    return JSON.parse(localStorage.getItem(storageKey) || '{}');
  }

  /**
   * Calculate engagement score from today's behavior.
   * Used by UserBehaviorData.engagementScore.
   */
  getEngagementScore(): number {
    const counts = this.getTodayCounts();
    let score = 0;

    // Weight different events
    score += (counts['habit_complete'] || 0) * 15;
    score += (counts['ai_message_sent'] || 0) * 10;
    score += (counts['app_open'] || 0) * 5;
    score += (counts['booking_click'] || 0) * 25;
    score += (counts['shop_purchase'] || 0) * 20;
    score += (counts['level_up'] || 0) * 30;
    score += (counts['streak_milestone'] || 0) * 30;

    return Math.min(100, score);
  }

  /**
   * Determine the user's current funnel stage based on their event history.
   */
  getFunnelStage(): string {
    const counts = this.getTodayCounts();

    if (counts['booking_complete']) return 'converted';
    if (counts['booking_click']) return 'booking_intent';
    if (counts['booking_modal_open']) return 'booking_aware';
    if (counts['paywall_shown']) return 'monetization_exposed';
    if (counts['ai_message_sent']) return 'engaged';
    if (counts['habit_complete']) return 'active';
    if (counts['habit_create']) return 'setup';
    if (counts['onboard_complete']) return 'onboarded';
    if (counts['app_open']) return 'visitor';

    return 'unknown';
  }
}

// Singleton instance
export const analytics = new AnalyticsService();

// Expose flush on page unload to avoid data loss
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      analytics.flush();
    }
  });

  window.addEventListener('beforeunload', () => {
    analytics.flush();
  });
}
