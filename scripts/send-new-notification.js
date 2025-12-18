#!/usr/bin/env node

/**
 * Send push notification for new Anna University notifications via Firebase Cloud Messaging (FCM)
 * 
 * Firebase Admin SDK requires a service account key for authentication.
 * The key should be provided via the FIREBASE_SERVICE_ACCOUNT environment variable.
 * 
 * Usage:
 *   node send-new-notification.js <notification_title> [notification_count]
 * 
 * Environment Variables:
 *   FIREBASE_SERVICE_ACCOUNT - JSON string of the Firebase service account key
 */

const admin = require('firebase-admin');

// Configuration
const FCM_TOPIC = 'anna-univ-notifications';
const COE_URL = 'https://coe.annauniv.edu';

// Get notification details from command line
const notificationTitle = process.argv[2];
const notificationCount = parseInt(process.argv[3] || '1', 10);

if (!notificationTitle) {
  console.error('❌ ERROR: Notification title is required');
  console.error('Usage: node send-new-notification.js <notification_title> [notification_count]');
  process.exit(1);
}

// Prepare title based on count
const title = notificationCount > 1 
  ? `${notificationCount} New Anna University Notifications`
  : 'New Anna University Notification';

console.log('');
console.log('================================================');
console.log('Sending New Notification Alert via Firebase FCM');
console.log('================================================');
console.log(`Topic: ${FCM_TOPIC}`);
console.log(`Count: ${notificationCount}`);
console.log(`Title: "${notificationTitle}"`);
console.log('');

// Initialize Firebase Admin SDK
function initializeFirebase() {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccountJson) {
      console.error('❌ ERROR: FIREBASE_SERVICE_ACCOUNT environment variable is not set');
      console.error('Please set the FIREBASE_SERVICE_ACCOUNT secret in GitHub repository settings');
      process.exit(1);
    }

    const serviceAccount = JSON.parse(serviceAccountJson);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    console.log('✓ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
    process.exit(1);
  }
}

// Send notification
async function sendNotification() {
  try {
    const message = {
      notification: {
        title: title,
        body: notificationTitle,
      },
      data: {
        click_action: COE_URL,
        type: 'new_notification',
        count: notificationCount.toString(),
      },
      topic: FCM_TOPIC,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
        },
      },
    };

    const response = await admin.messaging().send(message);
    
    console.log('FCM Response:', response);
    console.log('');
    console.log('✅ Push notification sent successfully!');
    console.log('');
    console.log('📱 Users with the app installed should receive notification');
    console.log(`   Topic: ${FCM_TOPIC}`);
  } catch (error) {
    console.error('❌ Error sending notification:', error.message);
    process.exit(1);
  }
}

// Main execution
initializeFirebase();
sendNotification()
  .then(() => {
    console.log('================================================');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
