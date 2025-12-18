#!/usr/bin/env node

/**
 * Send push notification for new Anna University notifications
 * 
 * This script compares the current notifications with previous notifications
 * and sends push notifications for new ones.
 * 
 * Usage:
 *   node send-new-notification.js <notification_title> [notification_count]
 * 
 * Environment Variables:
 *   FCM_SERVER_KEY - Firebase Cloud Messaging Server Key (required)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;

// Get notification details from command line
const notificationTitle = process.argv[2];
const notificationCount = parseInt(process.argv[3] || '1', 10);

if (!FCM_SERVER_KEY) {
  console.error('❌ ERROR: FCM_SERVER_KEY environment variable is not set');
  console.error('');
  console.error('Please add your Firebase Cloud Messaging Server Key as a GitHub secret:');
  console.error('1. Go to Firebase Console > Project Settings > Cloud Messaging');
  console.error('2. Copy the Server Key');
  console.error('3. Add it as FCM_SERVER_KEY in GitHub repository secrets');
  process.exit(1);
}

if (!notificationTitle) {
  console.error('❌ ERROR: Notification title is required');
  console.error('Usage: node send-new-notification.js <notification_title> [notification_count]');
  process.exit(1);
}

// Prepare notification payload
const payload = {
  notification: {
    title: notificationCount > 1 
      ? `${notificationCount} New Anna University Notifications`
      : 'New Anna University Notification',
    body: notificationTitle,
    sound: 'default',
  },
  data: {
    type: 'real_notification',
    timestamp: new Date().toISOString(),
    count: notificationCount.toString(),
  },
  priority: 'high',
  to: '/topics/all-devices',
};

// Prepare HTTP request
const postData = JSON.stringify(payload);

const options = {
  hostname: 'fcm.googleapis.com',
  port: 443,
  path: '/fcm/send',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `key=${FCM_SERVER_KEY}`,
    'Content-Length': Buffer.byteLength(postData),
  },
};

console.log('');
console.log('================================================');
console.log('Sending New Notification Alert via FCM');
console.log('================================================');
console.log(`Count: ${notificationCount}`);
console.log(`Title: "${notificationTitle}"`);
console.log('');

// Send the request
const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('FCM API Response:');
    console.log('Status Code:', res.statusCode);
    console.log('Response:', data);
    console.log('');

    if (res.statusCode === 200) {
      const response = JSON.parse(data);
      if (response.success >= 1) {
        console.log('✅ Push notification sent successfully!');
        console.log(`   Success count: ${response.success}`);
        console.log(`   Failure count: ${response.failure}`);
        console.log('');
        console.log('📱 Users should receive notification about new Anna University updates');
      } else {
        console.log('⚠️  Notification sent but no devices received it');
        console.log('   This might mean:');
        console.log('   - No devices are subscribed to the topic');
        console.log('   - The app is not installed on any device');
        console.log('   - FCM token is invalid or expired');
        if (response.results && response.results[0] && response.results[0].error) {
          console.log(`   Error: ${response.results[0].error}`);
        }
      }
    } else {
      console.log('⚠️  Failed to send notification (non-200 status)');
      console.log('   Check your FCM_SERVER_KEY is correct');
    }
    console.log('================================================');
  });
});

req.on('error', (error) => {
  console.error('❌ Error sending notification:', error.message);
  process.exit(1);
});

req.write(postData);
req.end();
