import { analytics } from '@/services/AnalyticsService';

const REFERRAL_KEY = 'spark_referral_code';
const REFERRED_BY_KEY = 'spark_referred_by';
const REFERRAL_COUNT_KEY = 'spark_referral_count';

export class ReferralService {
  /**
   * Generate a unique referral code for the current user.
   * Uses crypto.randomUUID for collision resistance, takes first 8 chars.
   */
  static generateCode(): string {
    const existing = localStorage.getItem(REFERRAL_KEY);
    if (existing) return existing;

    const code = crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase();
    localStorage.setItem(REFERRAL_KEY, code);
    analytics.track('referral_code_generated');
    return code;
  }

  /**
   * Get the current user's referral code (or generate one).
   */
  static getCode(): string {
    return localStorage.getItem(REFERRAL_KEY) || this.generateCode();
  }

  /**
   * Check URL for referral param and store it.
   * Call this on app mount.
   */
  static captureReferral(): string | null {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode && !localStorage.getItem(REFERRED_BY_KEY)) {
      localStorage.setItem(REFERRED_BY_KEY, refCode);
      analytics.track('referral_captured', { code: refCode });
      // Clean up URL without reload
      const url = new URL(window.location.href);
      url.searchParams.delete('ref');
      window.history.replaceState({}, '', url.toString());
      return refCode;
    }
    return localStorage.getItem(REFERRED_BY_KEY);
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
   * Get referral count (how many people used this code).
   * In production, this would query Supabase. For MVP, track locally.
   */
  static getReferralCount(): number {
    return parseInt(localStorage.getItem(REFERRAL_COUNT_KEY) || '0', 10);
  }

  /**
   * Increment referral count (called when a referee completes onboarding).
   */
  static incrementReferralCount(): void {
    const count = this.getReferralCount() + 1;
    localStorage.setItem(REFERRAL_COUNT_KEY, count.toString());
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
