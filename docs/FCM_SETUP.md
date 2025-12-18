# Firebase Cloud Messaging Setup Guide

This guide will help you set up Firebase Cloud Messaging (FCM) to enable push notifications from GitHub Actions to your Android app.

## Prerequisites

- A Google account
- The Anna University Notifications app installed on your Android device
- Access to the GitHub repository settings

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** or select an existing project
3. Enter a project name (e.g., "Anna Univ Notifications")
4. Accept the terms and click **Continue**
5. Disable Google Analytics (optional) and click **Create project**
6. Wait for the project to be created and click **Continue**

## Step 2: Add Android App to Firebase

1. In the Firebase Console, click the **Android icon** to add an Android app
2. Register your app with the following details:
   - **Android package name**: `com.annaunivnotifications`
   - **App nickname** (optional): Anna University Notifications
   - **Debug signing certificate SHA-1** (optional): Leave blank for now
3. Click **Register app**

## Step 3: Download google-services.json

1. After registering the app, you'll be prompted to download `google-services.json`
2. Click **Download google-services.json**
3. Save this file in your repository at:
   ```
   app/android/app/google-services.json
   ```
4. **Important**: If you're contributing to the public repository, do NOT commit this file. Add it to `.gitignore`

## Step 4: Get Firebase Cloud Messaging Server Key

1. In Firebase Console, go to **Project Settings** (click the gear icon)
2. Select the **Cloud Messaging** tab
3. Under **Cloud Messaging API (Legacy)**, you'll see:
   - **Server key**: This is what you need
   - **Sender ID**: Also note this down
4. Copy the **Server key** (it starts with something like `AAAAxxxxxxx...`)

## Step 5: Add FCM_SERVER_KEY to GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secret:
   - **Name**: `FCM_SERVER_KEY`
   - **Value**: Paste the Server key you copied from Firebase Console
5. Click **Add secret**

## Step 6: Build and Install the App

1. Place the `google-services.json` file in `app/android/app/`
2. Build the APK:
   - Go to **Actions** tab in GitHub
   - Select **Build APK** workflow
   - Click **Run workflow**
   - Download the built APK
3. Install the APK on your Android device
4. Open the app and grant notification permissions

## Step 7: Test the Notification System

### Test Manual Notifications
1. Go to **Actions** tab in GitHub repository
2. Select **Test Notifications** workflow
3. Click **Run workflow**
4. Enter a custom test message (optional)
5. Make sure "Skip FCM" is unchecked (false)
6. Click **Run workflow**
7. **Check your phone** - you should receive a push notification! 📱

### Test Automatic Notifications
- The system automatically checks for new notifications every 15 minutes
- When new notifications appear on coe.annauniv.edu, you'll receive push notifications automatically
- No action needed - just wait for new notifications to be posted!

## Troubleshooting

### "No devices subscribed" message
- Make sure the app is installed and has been opened at least once
- Check that notification permissions are granted in app settings
- The app automatically subscribes to the 'all-devices' topic on first launch

### "Invalid Server Key" error
- Verify the FCM_SERVER_KEY in GitHub secrets is correct
- Make sure you copied the complete key from Firebase Console
- The key should start with "AAAA" and be quite long

### App doesn't receive notifications
- Ensure the app has notification permissions
- Check that the app is not in battery optimization mode (Settings → Apps → Anna Univ Notifications → Battery → Unrestricted)
- Open the app once to ensure FCM token is registered
- Check the workflow logs for any errors

### google-services.json missing error during build
- Make sure you've placed the `google-services.json` file in `app/android/app/`
- The file name must be exactly `google-services.json`
- Verify the package name in the file matches `com.annaunivnotifications`

## How It Works

### Manual Test Notifications
1. **App Installation**: When you install and open the app:
   - The app registers with Firebase Cloud Messaging
   - It receives a unique FCM token
   - It automatically subscribes to the "all-devices" topic

2. **Sending Notifications**: When you run the Test Notifications workflow:
   - GitHub Actions runs the `send-test-notification.js` script
   - The script uses your FCM Server Key to authenticate with Firebase
   - It sends a push notification to the "all-devices" topic
   - Firebase delivers the notification to all subscribed devices

### Automatic Real Notifications
1. **Scheduled Check**: Every 15 minutes, GitHub Actions runs the fetch-notifications workflow
2. **Scraping**: The workflow scrapes notifications from coe.annauniv.edu
3. **Change Detection**: It compares with the previous data to find new notifications
4. **Push Notification**: If new notifications are found, it sends push notifications via FCM
5. **Delivery**: All devices subscribed to the topic receive the notification

### Receiving Notifications
When your device receives the FCM message:
- The app's Firebase service receives the notification
- It displays the notification using the device's notification system
- Tapping the notification opens the Anna University COE website

## Security Notes

- **Never commit** your `google-services.json` file to a public repository
- **Never share** your FCM Server Key publicly
- Store the FCM Server Key only in GitHub Secrets
- The FCM Server Key in GitHub Secrets is encrypted and only accessible to GitHub Actions

## Cost

Firebase Cloud Messaging is completely **FREE** with no limits for Android push notifications. There's no need for any paid plan.

## Support

If you encounter any issues:
1. Check the workflow logs in GitHub Actions
2. Check the Android logcat output when running the app
3. Verify all steps in this guide were followed correctly
4. Open an issue in the GitHub repository for help
