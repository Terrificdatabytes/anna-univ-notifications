#!/usr/bin/env node

/**
 * Send test notification via Firebase Cloud Messaging
 * 
 * This script sends a push notification to all devices subscribed to the 'all-devices' topic
 * or to a specific device token if provided.
 * 
 * Usage:
 *   node send-test-notification.js "Test Message" [deviceToken]
 * 
 * Environment Variables:
 *   FCM_SERVER_KEY - Firebase Cloud Messaging Server Key (required)
 */

const https = require('https');

// Configuration
const FCM_API_URL = 'https://fcm.googleapis.com/fcm/send';
const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;

// Get message from command line arguments
const testMessage = process.argv[2] || 'Testing Anna University notification system';
const deviceToken = process.argv[3] || null;

if (!FCM_SERVER_KEY) {
  console.error('❌ ERROR: FCM_SERVER_KEY environment variable is not set');
  console.error('');
  console.error('Please add your Firebase Cloud Messaging Server Key as a GitHub secret:');
  console.error('1. Go to Firebase Console > Project Settings > Cloud Messaging');
  console.error('2. Copy the Server Key');
  console.error('3. Add it as FCM_SERVER_KEY in GitHub repository secrets');
  process.exit(1);
}

// Prepare notification payload
const payload = {
  notification: {
    title: 'Anna University Notification Test',
    body: testMessage,
    sound: 'default',
  },
  data: {
    test: 'true',
    timestamp: new Date().toISOString(),
  },
  priority: 'high',
};

// Set target (specific device token or topic for all devices)
if (deviceToken) {
  payload.to = deviceToken;
  console.log('📱 Sending to specific device token');
} else {
  payload.to = '/topics/all-devices';
  console.log('📱 Sending to topic: all-devices');
}

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
console.log('Sending Test Notification via FCM');
console.log('================================================');
console.log(`Message: "${testMessage}"`);
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
        console.log('✅ Test notification sent successfully!');
        console.log(`   Success count: ${response.success}`);
        console.log(`   Failure count: ${response.failure}`);
        console.log('');
        console.log('📱 Users subscribed to the topic should receive the notification');
        console.log('   Make sure the app is installed and has subscribed to "all-devices" topic');
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
      console.log('❌ Failed to send notification');
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
