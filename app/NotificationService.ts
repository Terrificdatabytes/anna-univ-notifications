/**
 * Notification Service
 * Handles push notifications for new Anna University notifications
 * 
 * Push notifications are delivered via ntfy.sh - a free, open-source notification service.
 * Users can receive notifications by subscribing to the ntfy topic via:
 * - The ntfy app (Android/iOS)
 * - Web browser at ntfy.sh
 * - Or using the ntfy CLI
 */

import notifee, {AndroidImportance} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_URL =
  'https://raw.githubusercontent.com/Terrificdatabytes/anna-univ-notifications/main/data/notifications.json';
const CACHE_KEY = 'anna_univ_notifications';
const SEEN_IDS_KEY = 'seen_notification_ids';
const COE_URL = 'https://coe.annauniv.edu';

interface Notification {
  id: string;
  title: string;
  link: string | null;
  isNew: boolean;
}

interface NotificationData {
  notifications: Notification[];
  lastUpdated: string;
  count: number;
}

export class NotificationService {
  /**
   * Initialize the notification channel
   */
  static async initialize() {
    try {
      await notifee.createChannel({
        id: 'anna-univ-notifications',
        name: 'Anna University Notifications',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
      });
      console.log('Notification channel created');
    } catch (error) {
      console.error('Error creating notification channel:', error);
    }
  }

  /**
   * Request notification permissions
   */
  static async requestPermission(): Promise<boolean> {
    try {
      const settings = await notifee.requestPermission();
      return settings.authorizationStatus >= 1; // AUTHORIZED or PROVISIONAL
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Get seen notification IDs from storage
   */
  private static async getSeenIds(): Promise<Set<string>> {
    try {
      const stored = await AsyncStorage.getItem(SEEN_IDS_KEY);
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading seen IDs:', error);
    }
    return new Set();
  }

  /**
   * Save seen notification IDs to storage
   */
  private static async saveSeenIds(ids: Set<string>): Promise<void> {
    try {
      await AsyncStorage.setItem(SEEN_IDS_KEY, JSON.stringify([...ids]));
    } catch (error) {
      console.error('Error saving seen IDs:', error);
    }
  }

  /**
   * Check for new notifications and send push notifications
   */
  static async checkForNewNotifications(): Promise<void> {
    try {
      // Fetch latest notifications
      const response = await fetch(NOTIFICATIONS_URL);
      if (!response.ok) {
        console.error('Failed to fetch notifications:', response.status);
        return;
      }

      const data: NotificationData = await response.json();
      const seenIds = await this.getSeenIds();
      const newNotifications: Notification[] = [];

      // Find new notifications
      for (const notification of data.notifications) {
        if (!seenIds.has(notification.id)) {
          newNotifications.push(notification);
          seenIds.add(notification.id);
        }
      }

      // Send push notifications for new items
      if (newNotifications.length > 0) {
        await this.sendNotifications(newNotifications);
        await this.saveSeenIds(seenIds);
      }

      // Update cache
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error checking for new notifications:', error);
    }
  }

  /**
   * Send push notifications for new items
   */
  private static async sendNotifications(
    notifications: Notification[],
  ): Promise<void> {
    try {
      if (notifications.length === 1) {
        // Single notification
        const notification = notifications[0];
        await notifee.displayNotification({
          title: 'New Anna University Notification',
          body: notification.title,
          android: {
            channelId: 'anna-univ-notifications',
            importance: AndroidImportance.HIGH,
            pressAction: {
              id: 'default',
              launchActivity: 'default',
            },
            smallIcon: 'ic_launcher',
          },
          data: {
            url: COE_URL,
            notificationId: notification.id,
          },
        });
      } else {
        // Multiple notifications - show summary
        await notifee.displayNotification({
          title: 'Anna University Notifications',
          body: `${notifications.length} new notifications`,
          android: {
            channelId: 'anna-univ-notifications',
            importance: AndroidImportance.HIGH,
            pressAction: {
              id: 'default',
              launchActivity: 'default',
            },
            smallIcon: 'ic_launcher',
          },
          data: {
            url: COE_URL,
            count: notifications.length.toString(),
          },
        });
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  }

  /**
   * Clear all seen IDs (for testing purposes)
   */
  static async clearSeenIds(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SEEN_IDS_KEY);
      console.log('Cleared seen notification IDs');
    } catch (error) {
      console.error('Error clearing seen IDs:', error);
    }
  }
}
