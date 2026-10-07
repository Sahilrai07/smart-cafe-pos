'use client';

/**
 * Utility for handling Browser Web Push Notifications without third-party paid services.
 * Works even when the browser tab is minimized or in background.
 */

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
}

export function sendLocalNotification(title: string, options?: NotificationOptions): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      const n = new Notification(title, {
        icon: '/icons/coffee-icon.png',
        badge: '/icons/coffee-icon.png',
        ...options,
      });

      n.onclick = () => {
        window.focus();
        n.close();
      };

      // Vibrate mobile devices
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }

      return true;
    } catch (e) {
      console.warn('Error firing Notification:', e);
    }
  }

  return false;
}
