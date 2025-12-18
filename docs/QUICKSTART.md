# Quick Start Guide

This guide will help you quickly set up and test the push notification system.

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Firebase Project (2 minutes)

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it "Anna Univ Notifications" → Continue
4. Disable Google Analytics → Create project

### Step 2: Add Android App (1 minute)

1. Click Android icon (in Project Overview)
2. Package name: `com.annaunivnotifications`
3. Click "Register app"
4. Download `google-services.json`
5. Save it as: `app/android/app/google-services.json`

### Step 3: Get FCM Server Key (1 minute)

1. Click gear icon (Project Settings)
2. Go to "Cloud Messaging" tab
3. Copy the "Server key" (starts with AAAA...)
4. Keep this safe - you'll need it next

### Step 4: Add to GitHub (1 minute)

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `FCM_SERVER_KEY`
5. Value: Paste the server key
6. Click "Add secret"

## 🏗️ Build & Install

### Option 1: Use GitHub Actions (Recommended)

1. Go to Actions tab → Build APK workflow
2. Click "Run workflow"
3. Wait ~10 minutes for build to complete
4. Download APK from artifacts
5. Install on your Android device

### Option 2: Build Locally

```bash
cd app
npm install
npx react-native run-android
```

## 🧪 Test It!

### Test 1: Manual Test Notification

1. Open the app on your phone (important!)
2. Grant notification permission
3. Go to GitHub → Actions → Test Notifications
4. Click "Run workflow"
5. Enter test message: "Hello from GitHub!"
6. Click "Run workflow"
7. **Check your phone** - you should get a notification! 📱

### Test 2: Automatic Real Notifications

The system automatically checks for new notifications every 15 minutes.

**Trigger a test:**
1. The workflow runs automatically
2. When new notifications appear on coe.annauniv.edu
3. Your phone gets notified automatically! 🔔

**Check workflow status:**
- Go to Actions → Fetch Notifications
- See the latest run
- Check logs to see if notifications were sent

## 🔧 Troubleshooting

### "No devices subscribed"
- Open the app at least once
- Grant notification permissions
- Wait a few seconds for FCM to register

### "Invalid Server Key"
- Double-check the FCM_SERVER_KEY in GitHub secrets
- Make sure you copied the full key from Firebase Console
- Key should start with "AAAA"

### No notification received
- Check phone notification settings
- Disable battery optimization for the app
- Check FCM logs in workflow output

### Build failed
- Make sure `google-services.json` is in `app/android/app/`
- File name must be exactly `google-services.json`
- Package name in file must be `com.annaunivnotifications`

## 📱 Daily Usage

Once set up:
1. Install the app
2. Grant permissions
3. That's it! You'll automatically receive:
   - Push notifications when new announcements are posted
   - Real-time updates every 15 minutes
   - No need to open the app

**Optional:**
- Add home screen widget for quick view
- Pull to refresh for manual updates

## 🆘 Need Help?

For detailed setup instructions, see:
- [FCM Setup Guide](FCM_SETUP.md) - Complete Firebase setup
- [README](../README.md) - Full documentation

For issues:
- Check GitHub Actions logs
- Check Android logcat: `adb logcat *:E`
- Open an issue on GitHub

## 💡 Tips

1. **First time?** Open the app before testing notifications
2. **Testing?** Use "Test Notifications" workflow for quick tests
3. **Production?** Just install and forget - it works automatically!
4. **Debugging?** Check workflow logs for detailed information
5. **Battery?** Disable optimization for the app to ensure notifications work

## ✅ Verify Setup

Run this checklist:
- [ ] Firebase project created
- [ ] `google-services.json` downloaded and placed correctly
- [ ] FCM_SERVER_KEY added to GitHub secrets
- [ ] APK built successfully
- [ ] App installed on device
- [ ] Notification permission granted
- [ ] Test workflow executed
- [ ] Test notification received ✨

If all checked, you're good to go! 🎉
