/**
 * Anna University Notifications App
 *
 * @format
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  SafeAreaView,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  RefreshControl,
  Linking,
  ActivityIndicator,
  AppState,
  AppStateStatus,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, {EventType} from '@notifee/react-native';
import {NotificationService} from './NotificationService';

const THEME_COLOR = '#37B3B3';
const LOGO_IMAGE = require('./assets/images/anna-university3770.jpg');
// GitHub raw URL to fetch notifications - points to main branch data file
const NOTIFICATIONS_URL =
  'https://raw.githubusercontent.com/Terrificdatabytes/anna-univ-notifications/main/data/notifications.json';
const CACHE_KEY = 'anna_univ_notifications';
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

function App(): React.JSX.Element {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadCachedNotifications = async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const data: NotificationData = JSON.parse(cached);
        setNotifications(data.notifications);
        setLastUpdated(data.lastUpdated);
      }
    } catch (error) {
      console.error('Error loading cached notifications:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(NOTIFICATIONS_URL);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: NotificationData = await response.json();

      setNotifications(data.notifications);
      setLastUpdated(data.lastUpdated);

      // Cache the data
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // If fetch fails, cached data is already loaded
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const initializeNotifications = async () => {
    await NotificationService.initialize();
    await NotificationService.requestPermission();
    // Check for new notifications on app start
    await NotificationService.checkForNewNotifications();
  };

  const setupNotificationHandlers = () => {
    // Handle notification press - redirect to COE website
    notifee.onForegroundEvent(({type}) => {
      if (type === EventType.PRESS) {
        Linking.openURL(COE_URL).catch(err =>
          console.error('Error opening COE website:', err),
        );
      }
    });

    // Handle notification press when app is in background
    notifee.onBackgroundEvent(async ({type}) => {
      if (type === EventType.PRESS) {
        Linking.openURL(COE_URL).catch(err =>
          console.error('Error opening COE website:', err),
        );
      }
    });
  };

  const handleAppStateChange = useCallback(
    async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Check for new notifications when app comes to foreground
        await NotificationService.checkForNewNotifications();
        fetchNotifications();
      }
    },
    [],
  );

  // Initialize notification service and set up handlers
  useEffect(() => {
    initializeNotifications();
    setupNotificationHandlers();

    // Listen for app state changes to check for new notifications
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [handleAppStateChange]);

  // Load notifications from cache on mount
  useEffect(() => {
    loadCachedNotifications();
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleNotificationPress = (notification: Notification) => {
    // Only open COE website if notification has a link (defensive check)
    if (notification.link) {
      Linking.openURL(COE_URL).catch(err =>
        console.error('Error opening COE website:', err),
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderNotification = ({item}: {item: Notification}) => (
    <TouchableOpacity
      style={styles.notificationCard}
      onPress={() => handleNotificationPress(item)}
      disabled={!item.link}>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        {item.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
      </View>
      {item.link && <Text style={styles.tapHint}>Tap to open</Text>}
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Image source={LOGO_IMAGE} style={styles.logo} resizeMode="contain" />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Anna University</Text>
          <Text style={styles.headerSubtitle}>COE Notifications</Text>
        </View>
      </View>
      {lastUpdated && (
        <Text style={styles.lastUpdatedText}>
          Last updated: {formatDate(lastUpdated)}
        </Text>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No notifications available</Text>
      <Text style={styles.emptySubtext}>Pull down to refresh</Text>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <Text style={styles.footerText}>
        Developed by K.S.PRAVEEN (terrificdatabytes)
      </Text>
      <Text style={styles.footerSubtext}>
        2nd year CSE, Anna University Regional Campus Madurai
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={THEME_COLOR} />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME_COLOR} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME_COLOR} />
      {renderHeader()}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[THEME_COLOR]}
            tintColor={THEME_COLOR}
          />
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: THEME_COLOR,
    paddingVertical: 20,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 4,
    opacity: 0.9,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 8,
    opacity: 0.8,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  notificationTitle: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    flex: 1,
    marginRight: 8,
  },
  newBadge: {
    backgroundColor: '#FF5252',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tapHint: {
    fontSize: 12,
    color: THEME_COLOR,
    marginTop: 8,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  footerContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 16,
  },
  footerText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default App;
