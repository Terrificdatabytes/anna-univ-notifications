/**
 * Notification Service
 * Handles notifications for new Anna University notifications via polling.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform, PermissionsAndroid} from 'react-native';

const NOTIFICATIONS_URL =
  'https://raw.githubusercontent.com/Terrificdatabytes/anna-univ-notifications/main/data/notifications.json';
const CACHE_KEY = 'anna_univ_notifications';
const SEEN_IDS_KEY = 'seen_notification_ids';

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
   * Initialize notification service and request permissions
   */
  static async initialize() {
    try {
      await this.requestPermission();
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  /**
   * Request notification permissions
   */
  static async requestPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Android notification permission denied');
          return false;
        }
      }
      console.log('Notification permission granted');
      return true;
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
   * Check for new notifications and update seen IDs
   */
  static async checkForNewNotifications(): Promise<void> {
    try {
      const response = await fetch(NOTIFICATIONS_URL);
      if (!response.ok) {
        console.error('Failed to fetch notifications:', response.status);
        return;
      }

      const data: NotificationData = await response.json();
      const seenIds = await this.getSeenIds();
      let newCount = 0;

      for (const notification of data.notifications) {
        if (!seenIds.has(notification.id)) {
          newCount++;
          seenIds.add(notification.id);
        }
      }

      if (newCount > 0) {
        console.log(`Found ${newCount} new notification(s)`);
        await this.saveSeenIds(seenIds);
      }

      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error checking for new notifications:', error);
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
