#!/usr/bin/env node

/**
 * Send test notification via ntfy.sh
 * 
 * ntfy.sh is a free, open-source notification service that requires no account or API keys.
 * Users can subscribe to notifications by installing the ntfy app and subscribing to a topic.
 * 
 * Usage:
 *   node send-test-notification.js "Test Message" [topic]
 * 
 * Environment Variables:
 *   NTFY_TOPIC - The ntfy topic to send notifications to (optional, defaults to 'anna-univ-notifications')
 */

const https = require('https');

// Configuration - use environment variable or default topic
const NTFY_TOPIC = process.env.NTFY_TOPIC || 'anna-univ-notifications';

// Get message from command line arguments
const testMessage = process.argv[2] || 'Testing Anna University notification system';
const customTopic = process.argv[3] || NTFY_TOPIC;

console.log('');
console.log('================================================');
console.log('Sending Test Notification via ntfy.sh');
console.log('================================================');
console.log(`Topic: ${customTopic}`);
console.log(`Message: "${testMessage}"`);
console.log('');

// Prepare HTTP request for ntfy.sh
const postData = testMessage;

const options = {
  hostname: 'ntfy.sh',
  port: 443,
  path: `/${customTopic}`,
  method: 'POST',
  headers: {
    'Title': 'Anna University Notification Test',
    'Priority': 'high',
    'Tags': 'test,bell',
    'Click': 'https://coe.annauniv.edu',
    'Content-Type': 'text/plain',
    'Content-Length': Buffer.byteLength(postData),
  },
};

// Send the request
const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('ntfy.sh API Response:');
    console.log('Status Code:', res.statusCode);
    console.log('');

    if (res.statusCode === 200) {
      console.log('✅ Test notification sent successfully!');
      console.log('');
      console.log('📱 To receive notifications:');
      console.log(`   1. Install ntfy app from Play Store or F-Droid`);
      console.log(`   2. Subscribe to topic: ${customTopic}`);
      console.log(`   3. Or visit: https://ntfy.sh/${customTopic}`);
    } else {
      console.log('❌ Failed to send notification');
      console.log('Response:', data);
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
