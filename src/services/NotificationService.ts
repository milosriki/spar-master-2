import { analytics } from '@/services/AnalyticsService';

const NOTIFICATION_PERM_KEY = 'spark_notification_permission';
const NOTIFICATION_TIME_KEY = 'spark_notification_time';

export class NotificationService {
  /**
   * Check if notifications are supported in this browser.
   */
  static isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Get current notification permission status.
   */
  static getPermission(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  /**
   * Request notification permission.
   * Call this at an optimal moment (after first habit completion).
   */
  static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;

    // Don't re-prompt if already decided
    if (Notification.permission !== 'default') {
      return Notification.permission === 'granted';
    }

    try {
      const result = await Notification.requestPermission();
      localStorage.setItem(NOTIFICATION_PERM_KEY, result);

      if (result === 'granted') {
        analytics.track('notification_permission_granted');
        await this.registerServiceWorker();
        return true;
      } else {
        analytics.track('notification_permission_denied');
        return false;
      }
    } catch {
      return false;
    }
  }

  /**
   * Register the service worker for push notifications.
   */
  static async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) return null;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
      return null;
    }
  }

  /**
   * Send a local notification (no push server needed for MVP).
   */
  static async sendLocalNotification(title: string, body: string, tag?: string): Promise<void> {
    if (!this.isSupported() || Notification.permission !== 'granted') return;

    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: tag || 'spark-mastery',
      renotify: true,
      vibrate: [200, 100, 200],
      data: {
        url: window.location.origin,
      },
    });
  }

  /**
   * Schedule a streak reminder using the setTimeout approach.
   * In production, this would use a push server + VAPID keys.
   */
  static scheduleStreakReminder(streakDays: number): void {
    if (!this.isSupported() || Notification.permission !== 'granted') return;

    // Store preferred reminder time
    const reminderHour = parseInt(localStorage.getItem(NOTIFICATION_TIME_KEY) || '20', 10);

    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(reminderHour, 0, 0, 0);

    // If reminder time has passed today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const msUntilReminder = reminderTime.getTime() - now.getTime();

    setTimeout(() => {
      this.sendLocalNotification(
        'Streak Check-In',
        streakDays > 0
          ? `${streakDays}-day streak at risk! Complete a habit to keep it alive.`
          : 'Ready to start a new streak? Open Spark Mastery and crush it.',
        'streak-reminder',
      );
    }, msUntilReminder);
  }

  /**
   * Send a congratulatory notification after habit completion.
   */
  static async notifyHabitComplete(habitTitle: string, xpEarned: number): Promise<void> {
    await this.sendLocalNotification(
      'Habit Complete!',
      `Nice work on "${habitTitle}" -- earned ${xpEarned} XP`,
      'habit-complete',
    );
  }
}
