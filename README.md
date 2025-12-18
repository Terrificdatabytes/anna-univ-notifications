# Anna University Notifications

An automated system that fetches notifications from Anna University COE website and delivers them to an Android app.

## 🚀 Features

- ✅ Automatic notification scraping every 15 minutes
- ✅ **Real-time push notifications** when new notifications are posted on COE website
- ✅ **Automatic update notifications** - app checks for new versions and provides direct APK download link
- ✅ Manual test notification workflow to test push notifications
- ✅ Manual APK build trigger with version management
- ✅ Pull-to-refresh in the app
- ✅ Offline caching with AsyncStorage
- ✅ Clean notification list UI with teal theme (#37B3B3)
- ✅ Tap to open official links in browser
- ✅ "NEW" badge for new notifications
- ✅ **Home screen widget** to view latest notifications
- ✅ Direct link to COE website when tapping notifications
- ✅ **ntfy.sh integration** for free push notifications (no Firebase setup required!)

## 📁 Project Structure

```
/
├── .github/
│   └── workflows/
│       ├── fetch-notifications.yml  # Auto-fetch + send ntfy notifications every 15 min
│       ├── build-apk.yml            # Manual APK build
│       └── test-notifications.yml   # Test push notifications manually
├── scraper/
│   ├── package.json
│   └── index.js                     # Node.js scraper
├── app/
│   ├── android/                     # Android project files
│   ├── App.tsx                      # Main React Native app
│   ├── NotificationService.ts       # Notification service
│   └── package.json
├── scripts/
│   ├── send-test-notification.js    # Send test notification via ntfy.sh
│   └── send-new-notification.js     # Send notification for real updates
├── docs/
│   ├── NTFY_SETUP.md                # ntfy.sh setup guide (recommended)
│   └── FCM_SETUP.md                 # Firebase setup guide (optional)
└── data/
    └── notifications.json           # Scraped notifications data
```

## 🔧 How It Works

### 1. Notification Scraper
- Fetches notifications from Anna University COE website marquee section
- Extracts title, link, and "new" status
- Generates unique IDs using MD5 hash
- Saves to `data/notifications.json`

### 2. GitHub Actions
- **fetch-notifications.yml**: Runs every 15 minutes via cron job
  - Scrapes new notifications
  - Detects new notifications by comparing with previous data
  - Sends push notifications via ntfy.sh (free, no API keys required!)
  - Commits updated data to repository
- **build-apk.yml**: Manually triggered to build Android APK
- **test-notifications.yml**: Manually triggered to send test push notification

### 3. React Native App
- Fetches notifications from GitHub raw JSON URL
- Displays in a clean list with pull-to-refresh
- Offline caching for better performance
- Teal theme matching COE website
- **Automatic Update Checker**:
  - Checks for new app versions from GitHub releases (once per day)
  - Shows update banner when new version is available
  - Provides direct APK download link
  - Displays release notes
- **Push Notifications**: 
  - Automatically sent when new notifications are detected on COE website
  - Manual test notifications via GitHub Actions workflow
  - Uses ntfy.sh - free, open-source, no account required
- **Home Screen Widget**: Add widget to home screen to see latest notifications at a glance
- **Direct COE Link**: Tap any push notification or widget to open coe.annauniv.edu

## 📱 Installation

### For Users - Receive Push Notifications (2 Minutes!)

#### Step 1: Install ntfy App
Download the ntfy app on your Android device:
- **Google Play Store**: [ntfy](https://play.google.com/store/apps/details?id=io.heckel.ntfy)
- **F-Droid**: [ntfy](https://f-droid.org/packages/io.heckel.ntfy/)

#### Step 2: Subscribe to Notifications
1. Open the ntfy app
2. Tap the **+** button
3. Enter topic: `anna-univ-notifications`
4. Tap **Subscribe**

That's it! You'll now receive push notifications for new Anna University announcements! 📱

#### Optional: Install the Anna University App
1. Go to [Releases](../../releases)
2. Download the latest APK file
3. Enable "Install from Unknown Sources" in Android settings
4. Install the APK
5. Grant notification permissions when prompted
6. Add the widget to your home screen (optional):
   - Long press on home screen
   - Select "Widgets"
   - Find "AU Notifications" widget
   - Drag to home screen

### For Developers

#### Setup Scraper
```bash
cd scraper
npm install
npm start
```

#### Setup React Native App
```bash
cd app
npm install

# Run on Android
npm run android
```

## 🏗️ Building APK

The APK is built via GitHub Actions with proper version management:

1. **Build APK with Version**:
   - Go to **Actions** tab
   - Select **Build APK** workflow
   - Click **Run workflow**
   - Enter version number (e.g., "1.0", "1.1", "2.0")
   - Enter release notes
   - Click **Run workflow**
   - APK will be created as a GitHub Release with the specified version
   - Download from Releases page: `anna-univ-notifications-v{version}.apk`

2. **Version Management**:
   - Version format: `MAJOR.MINOR` or `MAJOR.MINOR.PATCH` (e.g., 1.0, 1.1, 2.0.1)
   - Version code is auto-calculated: `MAJOR*10000 + MINOR*100 + PATCH`
   - Example: v1.2 = version code 10200, v2.0.1 = version code 20001
   - The app automatically updates version info in code during build
   - See [Update System Guide](docs/UPDATE_SYSTEM.md) for detailed version management

## 🔄 App Updates

The app includes an automatic update system:

- **Checks for updates** once every 24 hours from GitHub releases
- **Shows update banner** when new version is available
- **Direct download link** to latest APK
- **Release notes** displayed in-app
- **Zero configuration** - works automatically for all users

When a new version is released:
1. Users see a green update banner on app startup
2. Tap "Update" to view release notes
3. Tap "Download" to get the latest APK
4. Install and enjoy new features! 🎉

For detailed information about the update system and releasing new versions, see the [Update System Guide](docs/UPDATE_SYSTEM.md).

## 🧪 Testing Notification System

### Test Manual Push Notifications

To test sending a push notification:

1. Install the ntfy app and subscribe to `anna-univ-notifications` topic
2. Go to **Actions** tab in GitHub
3. Select **Test Notifications** workflow
4. Click **Run workflow**
5. Enter a custom test message (optional)
6. Click **Run workflow**
7. **Check your phone** - you should receive a push notification! 📱

### Test via Command Line

You can also test directly from your terminal:
```bash
# Send a test notification
curl -d "Test notification from Anna University" https://ntfy.sh/anna-univ-notifications
```

### Test Automatic Notifications

The system automatically sends push notifications for new Anna University announcements:

1. The **fetch-notifications** workflow runs every 15 minutes
2. When new notifications appear on coe.annauniv.edu:
   - They are automatically scraped
   - Push notifications are sent to all subscribers via ntfy.sh
   - Your phone receives the notification in real-time
3. No manual action required - just wait for new notifications!

### Validation

The test workflow validates:
- ✅ Scraper successfully fetches notifications
- ✅ JSON data structure is valid
- ✅ All required fields are present (notifications, lastUpdated, count)
- ✅ Push notification is sent successfully via ntfy.sh

## 📊 Data Format

```json
{
  "notifications": [
    {
      "id": "a1b2c3d4",
      "title": "Review Results of April/May 2025 Examinations is Published",
      "link": "https://coe.annauniv.edu/aucoe/pdf/results.pdf",
      "isNew": true
    }
  ],
  "lastUpdated": "2025-12-17T10:30:00.000Z",
  "count": 15
}
```

## 🔑 Key Technologies

- **Scraper**: Node.js, Axios, Cheerio
- **App**: React Native 0.73, TypeScript
- **Push Notifications**: [ntfy.sh](https://ntfy.sh) (free, open-source, no setup required)
- **Widget**: Native Android widget (Kotlin)
- **Storage**: AsyncStorage
- **CI/CD**: GitHub Actions

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
