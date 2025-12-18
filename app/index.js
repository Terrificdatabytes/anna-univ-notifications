/**
 * @format
 */

import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';
import App from './App';
import {name as appName} from './app.json';

// Background message handler for FCM
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  
  // Display notification using notifee when app is in background
  if (remoteMessage.notification) {
    await notifee.displayNotification({
      title: remoteMessage.notification.title || 'Anna University Notification',
      body: remoteMessage.notification.body || 'New notification',
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
        url: 'https://coe.annauniv.edu',
      },
    });
  }
});

AppRegistry.registerComponent(appName, () => App);
