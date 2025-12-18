# Anna University Notifications - Feature Overview

## 🎯 Three Main Features

### 1. 🔔 Push Notifications System
Get real-time notifications on your Android device when new announcements are posted on coe.annauniv.edu

**How it works:**
```
COE Website → GitHub Actions (every 15 min) → Firebase Cloud Messaging → Your Phone 📱
```

**Features:**
- ✅ Automatic notifications every 15 minutes
- ✅ Manual test notifications via workflow
- ✅ Works even when app is closed
- ✅ One-time Firebase setup

### 2. 🔄 Automatic App Updates
Never miss new features! The app automatically checks for updates and provides direct download links.

**How it works:**
```
App Startup → Check GitHub Releases → New Version? → Show Update Banner → Direct APK Download
```

**Features:**
- ✅ Daily automatic update checks
- ✅ Update banner with release notes
- ✅ Direct APK download from GitHub
- ✅ Semantic versioning (1.0, 1.1, 2.0)

### 3. 📋 Notification Display
Clean, modern interface to view all Anna University notifications

**Features:**
- ✅ Pull-to-refresh
- ✅ Offline caching
- ✅ "NEW" badges
- ✅ Direct links to documents
- ✅ Home screen widget

---

## 📱 User Journey

### First Time Setup (5 minutes)
1. Follow [Quick Start Guide](QUICKSTART.md)
2. Create Firebase project
3. Build and install APK
4. Grant notification permissions
5. **Done!** 🎉

### Daily Usage (Automatic)
1. **You do nothing!** ✨
2. New announcements appear on COE website
3. You get notified instantly
4. Tap notification → Opens COE website
5. Open app → See all notifications

### When Update Available
1. Open app
2. See green "Update Available" banner
3. Tap "Update" → View release notes
4. Tap "Download" → Get latest APK
5. Install and enjoy new features! 🚀

---

## 🔧 For Developers

### Testing Push Notifications
```bash
# Go to GitHub Actions → Test Notifications workflow
# Enter test message: "Hello!"
# Click Run workflow
# Check your phone 📱
```

### Releasing New Version
```bash
# Go to GitHub Actions → Build APK workflow
# Enter version: "1.1"
# Enter release notes: "Added cool new feature"
# Click Run workflow
# APK created as GitHub release
```

### Monitoring
- **Notification logs**: Check workflow runs in Actions tab
- **Update adoption**: Check download counts on Releases page
- **Error tracking**: View workflow logs for any issues

---

## 🏗️ Architecture

### Tech Stack
```
Frontend:  React Native 0.73 + TypeScript
Push:      Firebase Cloud Messaging
Backend:   GitHub Actions + Node.js
Scraping:  Axios + Cheerio
Storage:   AsyncStorage
Widget:    Native Android (Kotlin)
```

### Workflows
```
1. fetch-notifications.yml   → Every 15 min → Scrape + Send Push
2. test-notifications.yml    → Manual      → Send Test Push
3. build-apk.yml             → Manual      → Build + Release
```

### Key Services
```
NotificationService.ts   → FCM management, notifications
UpdateService.ts         → GitHub releases, version check
App.tsx                  → Main UI, update banner
```

---

## 📊 Workflows at a Glance

### Fetch Notifications (Automatic - Every 15 min)
```
┌─────────────────────────────────────────────┐
│ 1. Scrape coe.annauniv.edu                  │
│ 2. Compare with previous data               │
│ 3. Found new? → Send FCM notification       │
│ 4. Commit updated data to repo              │
└─────────────────────────────────────────────┘
```

### Test Notifications (Manual)
```
┌─────────────────────────────────────────────┐
│ 1. User enters test message                 │
│ 2. Send FCM notification to all devices     │
│ 3. Users receive test notification          │
└─────────────────────────────────────────────┘
```

### Build APK (Manual)
```
┌─────────────────────────────────────────────┐
│ 1. User enters version (e.g., 1.1)          │
│ 2. Auto-update version in code              │
│ 3. Build APK with new version               │
│ 4. Create GitHub release v1.1               │
│ 5. Upload APK to release                    │
│ 6. Next app open → Users see update banner  │
└─────────────────────────────────────────────┘
```

---

## 🔐 Security

### Firebase Cloud Messaging
- ✅ Server key stored in GitHub Secrets (encrypted)
- ✅ Topic-based broadcasting (no individual tokens exposed)
- ✅ HTTPS communication only

### Update System
- ✅ APKs from official GitHub releases only
- ✅ Built via verified GitHub Actions
- ✅ Version verification before showing update

### Dependencies
- ✅ All packages checked for vulnerabilities
- ✅ CodeQL security scan: 0 alerts
- ✅ Regular security updates

---

## 📈 Benefits

### For Students
- ✅ Never miss important announcements
- ✅ Real-time notifications
- ✅ No need to check website repeatedly
- ✅ Always have latest app version

### For Developers
- ✅ Easy to maintain
- ✅ Automated workflows
- ✅ Version control
- ✅ Usage analytics via GitHub

### For Institution
- ✅ Better communication
- ✅ Faster information distribution
- ✅ Reduced website traffic
- ✅ Modern student engagement

---

## 🚀 Quick Links

- **Setup**: [Quick Start Guide](QUICKSTART.md)
- **Firebase**: [FCM Setup Guide](FCM_SETUP.md)
- **Updates**: [Update System Guide](UPDATE_SYSTEM.md)
- **Full Docs**: [README](../README.md)

---

## 📞 Support

Having issues?
1. Check the [Troubleshooting sections](FCM_SETUP.md#troubleshooting) in guides
2. Review [workflow logs](https://github.com/Terrificdatabytes/anna-univ-notifications/actions)
3. Open an [issue on GitHub](https://github.com/Terrificdatabytes/anna-univ-notifications/issues)

---

## 🎉 Success Metrics

Once fully set up:
- ⏱️ **Update Speed**: New notifications reach users in < 15 minutes
- 📱 **Reliability**: Push notifications work 24/7
- 🔄 **Update Adoption**: Users get updates within 24 hours
- 💪 **Zero Maintenance**: Fully automated system

---

**Made with ❤️ by K.S.PRAVEEN (terrificdatabytes)**
*2nd Year CSE, Anna University Regional Campus Madurai*
