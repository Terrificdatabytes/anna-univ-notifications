# ntfy.sh Push Notification Setup Guide

This project uses [ntfy.sh](https://ntfy.sh) - a free, open-source notification service that requires **no account, no API keys, and no setup**!

## What is ntfy.sh?

ntfy.sh is a simple HTTP-based pub-sub notification service. It allows you to:
- Send push notifications from any script or service
- Receive notifications on your phone via the ntfy app
- No Firebase/FCM setup required
- Completely free with no limits
- Self-hostable if you prefer

## Quick Start (2 Minutes!)

### Step 1: Install the ntfy App

Download the ntfy app on your Android device:
- **Google Play Store**: [ntfy](https://play.google.com/store/apps/details?id=io.heckel.ntfy)
- **F-Droid**: [ntfy](https://f-droid.org/packages/io.heckel.ntfy/)

### Step 2: Subscribe to the Topic

1. Open the ntfy app
2. Tap the **+** button to add a subscription
3. Enter the topic name: `anna-univ-notifications`
4. Tap **Subscribe**

That's it! You'll now receive push notifications whenever there's a new Anna University announcement.

## How It Works

### Sending Notifications (GitHub Actions)

When new notifications are detected on coe.annauniv.edu:
1. The GitHub Action scraper detects the new notification
2. It sends a simple HTTP POST request to `https://ntfy.sh/anna-univ-notifications`
3. ntfy.sh delivers the notification to all subscribed devices

### Receiving Notifications (Your Phone)

1. The ntfy app maintains a connection to ntfy.sh servers
2. When a notification is published to your subscribed topic, it's delivered instantly
3. You receive a push notification on your phone

## Testing the System

### Test via GitHub Actions

1. Go to the **Actions** tab in the GitHub repository
2. Select **Test Notifications** workflow
3. Click **Run workflow**
4. Enter a custom test message (optional)
5. Click **Run workflow**
6. Check your phone - you should receive a notification!

### Test Manually (Optional)

You can also test by sending a notification from your terminal:

```bash
# Simple notification
curl -d "Test notification from Anna University" https://ntfy.sh/anna-univ-notifications

# With title
curl -H "Title: Anna University Update" \
     -d "New results have been published!" \
     https://ntfy.sh/anna-univ-notifications
```

### Test via Web Browser

1. Open https://ntfy.sh/anna-univ-notifications in your browser
2. Click the **Publish** button
3. Enter a message and click **Send**
4. Check your phone!

## Advanced Features

### Custom Topic Names

By default, this project uses `anna-univ-notifications` as the topic. You can customize this:

1. Fork this repository
2. Update the `NTFY_TOPIC` environment variable in:
   - `.github/workflows/fetch-notifications.yml`
   - `.github/workflows/test-notifications.yml`
3. Subscribe to your custom topic in the ntfy app

### Priority Levels

The notification scripts support different priority levels:
- `urgent` - Vibration, LED, and sound even in DND mode
- `high` - Vibration and sound (default for this project)
- `default` - Standard notification
- `low` - No sound
- `min` - No sound, no vibration

### Web Push Notifications

You can also receive notifications in your browser:
1. Visit https://ntfy.sh/anna-univ-notifications
2. Enable browser notifications when prompted
3. Keep the tab open to receive notifications

## Comparison with Firebase Cloud Messaging

| Feature | ntfy.sh | Firebase FCM |
|---------|---------|--------------|
| Setup Required | None | Create Firebase project, configure app |
| API Key Required | No | Yes (Server Key) |
| Cost | Free | Free |
| Account Required | No | Google account |
| Self-hostable | Yes | No |
| Rate Limits | None | Yes |
| Privacy | Better (minimal data collection) | Google collects data |

## Troubleshooting

### Not Receiving Notifications

1. **Check subscription**: Open ntfy app → verify you're subscribed to `anna-univ-notifications`
2. **Enable notifications**: Go to Android Settings → Apps → ntfy → Notifications → Enable
3. **Battery optimization**: Disable battery optimization for ntfy app
4. **Test manually**: Send a test notification using curl (see above)

### Notifications Delayed

ntfy uses an instant delivery mode by default. If notifications are delayed:
1. Check your internet connection
2. Ensure the ntfy app is not restricted by battery optimization
3. Try enabling "WebSocket" in ntfy app settings

### Want More Privacy?

You can self-host ntfy server:
1. Follow the [self-hosting guide](https://docs.ntfy.sh/install/)
2. Update the scripts to use your server URL instead of `ntfy.sh`

## Additional Resources

- **ntfy.sh Documentation**: https://docs.ntfy.sh/
- **ntfy.sh GitHub**: https://github.com/binwiederhier/ntfy
- **Web Interface**: https://ntfy.sh/anna-univ-notifications
- **API Reference**: https://docs.ntfy.sh/publish/

## Support

If you encounter issues:
1. Check the [ntfy.sh documentation](https://docs.ntfy.sh/)
2. Test with a simple curl command
3. Open an issue in this GitHub repository
