# Anna University Notifications

An automated system that fetches notifications from Anna University COE website and delivers them to an Android app.

## 🚀 Features

- ✅ Automatic notification scraping every 30 minutes
- ✅ Manual APK build trigger
- ✅ Pull-to-refresh in the app
- ✅ Offline caching with AsyncStorage
- ✅ Clean notification list UI with teal theme (#37B3B3)
- ✅ Tap to open official links in browser
- ✅ "NEW" badge for new notifications

## 📁 Project Structure

```
/
├── .github/
│   └── workflows/
│       ├── fetch-notifications.yml  # Auto-fetch notifications every 30 min
│       └── build-apk.yml            # Manual APK build
├── scraper/
│   ├── package.json
│   └── index.js                     # Node.js scraper
├── app/
│   ├── android/                     # Android project files
│   ├── App.tsx                      # Main React Native app
│   └── package.json
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
- **fetch-notifications.yml**: Runs every 30 minutes via cron job
- **build-apk.yml**: Manually triggered to build Android APK

### 3. React Native App
- Fetches notifications from GitHub raw JSON URL
- Displays in a clean list with pull-to-refresh
- Offline caching for better performance
- Teal theme matching COE website

## 📱 Installation

### For Users
1. Go to [Releases](../../releases)
2. Download the latest APK file
3. Enable "Install from Unknown Sources" in Android settings
4. Install the APK

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

The APK is built automatically via GitHub Actions:

1. Go to **Actions** tab
2. Select **Build APK** workflow
3. Click **Run workflow**
4. Download the APK from artifacts or releases

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
- **Storage**: AsyncStorage
- **CI/CD**: GitHub Actions

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
