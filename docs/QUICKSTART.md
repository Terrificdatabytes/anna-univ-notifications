# Quick Start Guide

This guide will help you quickly set up and test the push notification system using ntfy.sh.

## 🚀 Quick Setup (2 minutes!)

No Firebase setup needed! ntfy.sh is free and requires no account or API keys.

### Step 1: Install the ntfy App

1. Download the ntfy app on your Android device:
   - **Google Play Store**: [ntfy](https://play.google.com/store/apps/details?id=io.heckel.ntfy)
   - **F-Droid**: [ntfy](https://f-droid.org/packages/io.heckel.ntfy/)

### Step 2: Subscribe to the Topic

1. Open the ntfy app
2. Tap the **+** button to add a subscription
3. Enter the topic name: `anna-univ-notifications`
4. Tap **Subscribe**

That's it! You'll now receive push notifications whenever there's a new Anna University announcement.

## 🏗️ Build & Install the App (Optional)

If you want to build and install the Android app:

### Option 1: Use GitHub Actions (Recommended)

1. Go to Actions tab → Build APK workflow
2. Click "Run workflow"
3. Enter a version number
4. Wait ~10 minutes for build to complete
5. Download APK from GitHub Releases
6. Install on your Android device

### Option 2: Build Locally

```bash
cd app
npm install
npx react-native run-android
```

## 🧪 Test It!

### Test 1: Manual Test Notification

1. Make sure you're subscribed to `anna-univ-notifications` in the ntfy app
2. Go to GitHub → Actions → Test Notifications
3. Click "Run workflow"
4. Enter test message: "Hello from GitHub!"
5. Click "Run workflow"
6. **Check your phone** - you should get a notification! 📱

### Test 2: Automatic Real Notifications

The system automatically checks for new notifications every 15 minutes.

**How it works:**
1. GitHub Actions scrapes coe.annauniv.edu every 15 minutes
2. When new notifications are found, it sends a push notification via ntfy.sh
3. Your phone gets notified automatically! 🔔

**Check workflow status:**
- Go to Actions → Fetch Notifications
- See the latest run
- Check logs to see if notifications were sent

## 🔧 Troubleshooting

### Not receiving notifications
- Check that you're subscribed to `anna-univ-notifications` in the ntfy app
- Enable notifications for the ntfy app in Android settings
- Disable battery optimization for the ntfy app

### No notification received
- Check phone notification settings
- Make sure ntfy app is not restricted by battery optimization
- Try enabling "WebSocket" in ntfy app settings

## 📱 Daily Usage

Once set up:
1. Subscribe to the topic in ntfy
2. That's it! You'll automatically receive:
   - Push notifications when new announcements are posted
   - Real-time updates every 15 minutes
   - No need to keep any app open

**Optional:**
- Install the Anna University Notifications app for a better viewing experience
- Add home screen widget for quick view
- Pull to refresh for manual updates

## 🆘 Need Help?

For detailed setup instructions, see:
- [ntfy.sh Setup Guide](NTFY_SETUP.md) - Complete push notification setup
- [README](../README.md) - Full documentation

For issues:
- Check GitHub Actions logs
- Test with a simple curl command (see NTFY_SETUP.md)
- Open an issue on GitHub

## 💡 Tips

1. **First time?** Just install ntfy app and subscribe to the topic
2. **Testing?** Use "Test Notifications" workflow for quick tests
3. **Production?** Just subscribe and forget - it works automatically!
4. **Debugging?** Check workflow logs for detailed information
5. **Battery?** Disable optimization for ntfy app to ensure notifications work

## ✅ Verify Setup

Run this checklist:
- [ ] ntfy app installed on device
- [ ] Subscribed to `anna-univ-notifications` topic
- [ ] Notification permission granted for ntfy app
- [ ] Test workflow executed
- [ ] Test notification received ✨

If all checked, you're good to go! 🎉
