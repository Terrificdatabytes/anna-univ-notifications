# Firebase Cloud Messaging Setup Guide

This project uses [Firebase Cloud Messaging (FCM)](https://firebase.google.com/docs/cloud-messaging) for push notifications.

## Prerequisites

- A Google account
- Access to the GitHub repository settings
- Firebase project (already created: `anna-univ-notifications`)

## For Users

### Receiving Push Notifications

Push notifications work automatically! Simply:

1. Download and install the Anna University Notifications app from [Releases](../../releases)
2. Grant notification permissions when prompted
3. You'll automatically receive notifications for new Anna University announcements

No additional setup required! 📱

## For Repository Maintainers

### Step 1: Firebase Project Setup

The Firebase project is already configured:
- **Project ID**: `anna-univ-notifications`
- **Project Number**: `28313691300`
- **Android Package**: `com.annaunivnotifications`

### Step 2: Google Services Configuration

The `google-services.json` file is **NOT** included in the repository for security reasons. An example template file (`google-services.json.example`) is provided to help you get started.

To set up your own Firebase configuration:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Add an Android app with package name: `com.annaunivnotifications`
4. Download the `google-services.json` file
5. Place it at: `app/android/app/google-services.json`

Alternatively, copy the example file and fill in your own values:
```bash
cp app/android/app/google-services.json.example app/android/app/google-services.json
# Then edit the file with your Firebase project credentials
```

This file contains:
- Project configuration
- API keys (should be kept private)
- App-specific settings

### Step 3: Generate Service Account Key

To send push notifications from GitHub Actions, you need a Firebase service account key:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select the `anna-univ-notifications` project
3. Go to **Project Settings** → **Service accounts**
4. Click **Generate new private key**
5. Download the JSON file

### Step 4: Add GitHub Secret

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secret:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: Paste the entire contents of the service account JSON file
5. Click **Add secret**

### Step 5: Test the Setup

1. Go to **Actions** tab in GitHub repository
2. Select **Test Notifications** workflow
3. Click **Run workflow**
4. Enter a test message (optional)
5. Click **Run workflow**
6. Check your phone - you should receive a notification!

## How It Works

### Sending Notifications (GitHub Actions)

When new notifications are detected on coe.annauniv.edu:
1. The GitHub Action scraper detects the new notification
2. It uses the Firebase Admin SDK to send a push notification
3. The notification is sent to the `anna-univ-notifications` topic
4. All subscribed devices receive the notification

### Receiving Notifications (App)

1. On app launch, it registers with Firebase Cloud Messaging
2. It subscribes to the `anna-univ-notifications` topic
3. When a notification is published, it's delivered to all subscribed devices
4. Tapping the notification opens the Anna University COE website

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  GitHub Actions │────▶│  Firebase    │────▶│  Android    │
│  (Scraper +     │     │  FCM Server  │     │  App        │
│   Admin SDK)    │     │              │     │             │
└─────────────────┘     └──────────────┘     └─────────────┘
         │                                           │
         │         ┌──────────────────┐              │
         └────────▶│  notifications   │◀─────────────┘
                   │  .json (GitHub)  │
                   └──────────────────┘
```

## Configuration Files

### google-services.json

Location: `app/android/app/google-services.json` (NOT committed - use `.example` as template)

Contains:
- `project_info`: Firebase project configuration
- `client`: Android app configuration
- `api_key`: API key for Firebase services

**Important**: This file should NOT be committed to the repository. Use `google-services.json.example` as a template and add your own Firebase credentials.

### Notification Scripts

Location: `scripts/`

- `send-test-notification.js`: Sends test notifications via FCM
- `send-new-notification.js`: Sends real notifications when new updates are found

## Troubleshooting

### "FIREBASE_SERVICE_ACCOUNT not set" error

- Make sure you've added the `FIREBASE_SERVICE_ACCOUNT` secret to GitHub repository secrets
- Verify the secret value contains the complete JSON content from the service account file

### App doesn't receive notifications

1. Ensure the app has notification permissions
2. Check that the app is not in battery optimization mode:
   - Settings → Apps → Anna Univ Notifications → Battery → Unrestricted
3. Open the app once to ensure FCM token is registered
4. Check the workflow logs for any errors

### Notifications delayed

1. Check your internet connection
2. Ensure the app has unrestricted background activity
3. Try clearing app data and re-opening the app

### Build fails with Firebase errors

1. Ensure `google-services.json` is present in `app/android/app/` (copy from `google-services.json.example` and fill in your credentials)
2. Check that the package name matches: `com.annaunivnotifications`
3. Verify Firebase dependencies in `build.gradle` files

## Security Notes

- The `google-services.json` file contains API keys and should **NOT be committed** to the repository
- Use `google-services.json.example` as a template for your own configuration
- **Never commit** the service account key file
- Store the service account key only in GitHub Secrets
- The service account key in GitHub Secrets is encrypted

## Cost

Firebase Cloud Messaging is completely **FREE** with no limits for Android push notifications.

## Support

If you encounter any issues:
1. Check the workflow logs in GitHub Actions
2. Check the Android logcat output when running the app
3. Verify all steps in this guide were followed correctly
4. Open an issue in the GitHub repository for help
