/**
 * Notification Service
 * Handles push notifications for new Anna University notifications
 * 
 * Push notifications are delivered via Firebase Cloud Messaging (FCM).
 * Users receive notifications automatically when the app is installed and
 * notification permissions are granted.
 */

import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform, PermissionsAndroid} from 'react-native';

const NOTIFICATIONS_URL =
  'https://raw.githubusercontent.com/Terrificdatabytes/anna-univ-notifications/main/data/notifications.json';
const CACHE_KEY = 'anna_univ_notifications';
const SEEN_IDS_KEY = 'seen_notification_ids';
const FCM_TOKEN_KEY = 'fcm_token';
const FCM_TOPIC = 'anna-univ-notifications';

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
   * Initialize Firebase messaging and subscribe to topic
   */
  static async initialize() {
    try {
      // Request permission first
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log('Notification permission not granted');
        return;
      }

      // Get FCM token
      const token = await messaging().getToken();
      console.log('FCM Token:', token);

      // Save token for reference
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);

      // Subscribe to the topic for receiving notifications
      await messaging().subscribeToTopic(FCM_TOPIC);
      console.log('Subscribed to topic:', FCM_TOPIC);

      // Set up background message handler
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Background message received:', remoteMessage);
      });

      console.log('Firebase messaging initialized');
    } catch (error) {
      console.error('Error initializing Firebase messaging:', error);
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

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Notification permission granted');
      }
      return enabled;
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
   * Note: Push notifications are now handled by FCM server-side (GitHub Actions)
   * This method updates the local cache and tracks seen notifications
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
      let newCount = 0;

      // Track which notifications are new (not seen before)
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

      // Update cache
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error checking for new notifications:', error);
    }
  }

  /**
   * Get FCM token for debugging purposes
   */
  static async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(FCM_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
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

  /**
   * Unsubscribe from topic (if needed)
   */
  static async unsubscribeFromTopic(): Promise<void> {
    try {
      await messaging().unsubscribeFromTopic(FCM_TOPIC);
      console.log('Unsubscribed from topic:', FCM_TOPIC);
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
    }
  }
}
