import { analytics } from '@/services/AnalyticsService';
import { supabase } from '@/integrations/supabase/client';

const REFERRAL_KEY = 'spark_referral_code';
const REFERRED_BY_KEY = 'spark_referred_by';
const REFERRAL_COUNT_KEY = 'spark_referral_count';

// Helper for tables not yet in generated Supabase types (referral_codes is in migration 006)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fromTable = (table: string) => (supabase as unknown as { from: (t: string) => any }).from(table);

export class ReferralService {
  /**
   * Generate a unique referral code for the current user.
   * Saves to Supabase referral_codes table with localStorage cache.
   */
  static generateCode(): string {
    const existing = localStorage.getItem(REFERRAL_KEY);
    if (existing) return existing;

    const code = crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase();
    localStorage.setItem(REFERRAL_KEY, code);
    analytics.track('referral_code_generated');

    // Persist to Supabase (fire-and-forget)
    this._saveCodeToSupabase(code);
    return code;
  }

  private static async _saveCodeToSupabase(code: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await fromTable('referral_codes')
        .upsert({ user_id: user.id, code, referral_count: 0 }, { onConflict: 'code' });
    } catch (e) {
      console.error('Referral code save failed:', e);
    }
  }

  /**
   * Get the current user's referral code (or generate one).
   */
  static getCode(): string {
    return localStorage.getItem(REFERRAL_KEY) || this.generateCode();
  }

  /**
   * Check URL for referral param and store it.
   * Increments referrer's count in Supabase.
   */
  static captureReferral(): string | null {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode && !localStorage.getItem(REFERRED_BY_KEY)) {
      localStorage.setItem(REFERRED_BY_KEY, refCode);
      analytics.track('referral_captured', { code: refCode });

      // Increment referrer's count in Supabase
      this._incrementReferrerCount(refCode);

      // Clean up URL without reload
      const url = new URL(window.location.href);
      url.searchParams.delete('ref');
      window.history.replaceState({}, '', url.toString());
      return refCode;
    }
    return localStorage.getItem(REFERRED_BY_KEY);
  }

  private static async _incrementReferrerCount(code: string): Promise<void> {
    try {
      const { data } = await fromTable('referral_codes')
        .select('id, referral_count')
        .eq('code', code)
        .single();

      if (data) {
        await fromTable('referral_codes')
          .update({ referral_count: (data.referral_count || 0) + 1 })
          .eq('id', data.id);
      }
    } catch (e) {
      console.error('Referral count increment failed:', e);
    }
  }

  /**
   * Get the referral link for sharing.
   */
  static getShareLink(): string {
    const code = this.getCode();
    const base = window.location.origin;
    return `${base}?ref=${code}`;
  }

  /**
   * Get referral count from Supabase with localStorage fallback.
   */
  static async getReferralCountAsync(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return this.getReferralCount();

      const { data } = await fromTable('referral_codes')
        .select('referral_count')
        .eq('user_id', user.id)
        .single();

      if (data) {
        localStorage.setItem(REFERRAL_COUNT_KEY, data.referral_count.toString());
        return data.referral_count;
      }
    } catch {
      // fallback
    }
    return this.getReferralCount();
  }

  /**
   * Get referral count from localStorage (sync, fast).
   */
  static getReferralCount(): number {
    return parseInt(localStorage.getItem(REFERRAL_COUNT_KEY) || '0', 10);
  }

  /**
   * Share the referral link via Web Share API or clipboard.
   */
  static async shareReferral(): Promise<'shared' | 'copied' | 'failed'> {
    const link = this.getShareLink();
    const text = `Join me on Spark Mastery -- gamify your fitness journey! Use my link for bonus gold: ${link}`;

    analytics.track('referral_shared');

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Spark Mastery',
          text,
          url: link,
        });
        return 'shared';
      } catch {
        // User cancelled
      }
    }

    try {
      await navigator.clipboard.writeText(link);
      return 'copied';
    } catch {
      return 'failed';
    }
  }

  /**
   * Get the referral code that referred the current user (if any).
   */
  static getReferredBy(): string | null {
    return localStorage.getItem(REFERRED_BY_KEY);
  }
}
