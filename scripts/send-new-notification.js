#!/usr/bin/env node

/**
 * Send push notification for new Anna University notifications via ntfy.sh
 * 
 * ntfy.sh is a free, open-source notification service that requires no account or API keys.
 * 
 * Usage:
 *   node send-new-notification.js <notification_title> [notification_count]
 * 
 * Environment Variables:
 *   NTFY_TOPIC - The ntfy topic to send notifications to (optional, defaults to 'anna-univ-notifications')
 */

const https = require('https');

// Configuration - use environment variable or default topic
const NTFY_TOPIC = process.env.NTFY_TOPIC || 'anna-univ-notifications';

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
console.log('Sending New Notification Alert via ntfy.sh');
console.log('================================================');
console.log(`Topic: ${NTFY_TOPIC}`);
console.log(`Count: ${notificationCount}`);
console.log(`Title: "${notificationTitle}"`);
console.log('');

// Prepare HTTP request for ntfy.sh
const postData = notificationTitle;

const options = {
  hostname: 'ntfy.sh',
  port: 443,
  path: `/${NTFY_TOPIC}`,
  method: 'POST',
  headers: {
    'Title': title,
    'Priority': 'high',
    'Tags': 'loudspeaker,school',
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
      console.log('✅ Push notification sent successfully!');
      console.log('');
      console.log('📱 Users subscribed to the topic should receive notification');
      console.log(`   Topic: ${NTFY_TOPIC}`);
      console.log(`   Web: https://ntfy.sh/${NTFY_TOPIC}`);
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
