# App Update System Guide

This guide explains how the automatic update system works and how to release new versions.

## 📱 How It Works (User Perspective)

### Automatic Update Checks
- The app automatically checks for updates once every 24 hours
- No manual action needed from users
- Checks happen in the background on app startup

### When Update is Available
1. A **green banner** appears at the top of the app
2. Banner shows: "🎉 Update Available - Version X.X is ready to download"
3. Two buttons: "Later" and "Update"

### Installing Updates
1. Tap **"Update"** button
2. Dialog shows release notes
3. Tap **"Download"** to open browser
4. APK downloads from GitHub releases
5. Open APK to install update
6. Done! 🎉

## 🔧 How It Works (Technical)

### Version Management

**Version Format:**
- Semantic versioning: `MAJOR.MINOR.PATCH`
- Examples: `1.0`, `1.1`, `2.0.1`

**Version Code Calculation:**
```
VERSION_CODE = MAJOR * 10000 + MINOR * 100 + PATCH
```

Examples:
- v1.0 → 10000
- v1.1 → 10100
- v1.2.3 → 10203
- v2.0 → 20000
- v3.5.2 → 30502

### Update Check Flow

```
App Startup
    ↓
Check Last Update Check Time
    ↓
If > 24 hours → Check GitHub API
    ↓
GET /repos/Terrificdatabytes/anna-univ-notifications/releases/latest
    ↓
Parse version from tag_name
    ↓
Compare version codes
    ↓
If latest > current → Show Update Banner
```

### Components

**UpdateService.ts:**
- Checks GitHub releases API
- Parses version information
- Compares versions
- Returns update info

**UpdateNotification.tsx:**
- Green banner UI component
- Shows version and release notes
- Handles download action

**App.tsx:**
- Calls update check on startup
- Shows/hides update banner
- Manages update state

## 🚀 Releasing New Versions

### Step 1: Decide Version Number

Follow semantic versioning:
- **MAJOR**: Breaking changes, complete redesign
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes only

Examples:
- Bug fixes: 1.0 → 1.0.1 or 1.1 → 1.1.1
- New features: 1.0 → 1.1 or 1.5 → 1.6
- Major changes: 1.9 → 2.0

### Step 2: Run Build Workflow

1. Go to **Actions** tab in GitHub
2. Click **Build APK** workflow
3. Click **Run workflow**
4. Fill in the form:
   - **Version**: Enter version number (e.g., `1.1`)
   - **Release notes**: Enter what's new
5. Click **Run workflow**

### Step 3: Workflow Process

The workflow automatically:
1. Calculates version code from version number
2. Updates `app/android/app/build.gradle` with new version
3. Updates `app/UpdateService.ts` with current version
4. Builds the APK with new version
5. Renames APK: `anna-univ-notifications-v{version}.apk`
6. Creates GitHub release with tag `v{version}`
7. Uploads APK to release
8. Adds release notes

### Step 4: Verify Release

1. Go to **Releases** page
2. Check new release is created
3. Verify APK is attached
4. Test download link

### Step 5: Users Get Notified

- Next time users open the app (after 24 hours):
  - Update check runs automatically
  - If new version found, banner appears
  - Users can download and install

## 📝 Release Notes Best Practices

### Good Release Notes:
```
## What's New in v1.1

✨ **New Features:**
- Added automatic update system
- Push notifications for real-time alerts

🐛 **Bug Fixes:**
- Fixed notification display issue
- Improved app stability

🔧 **Improvements:**
- Faster app startup
- Better error handling
```

### Bad Release Notes:
```
Bug fixes and improvements
```

## 🔍 Version Comparison Logic

The app uses **version codes** to compare versions (not version names):

```typescript
if (latestVersionCode > currentVersionCode) {
  // Update available
}
```

This ensures proper comparison:
- ✅ 10100 (v1.1) > 10000 (v1.0) → Update shown
- ✅ 20000 (v2.0) > 10900 (v1.9) → Update shown
- ✅ 10203 (v1.2.3) > 10202 (v1.2.2) → Update shown

## 🛠️ Troubleshooting

### Update not detected

**Possible causes:**
1. Less than 24 hours since last check
   - **Solution**: Wait or force check (not implemented yet)

2. No releases on GitHub
   - **Solution**: Create a release using Build APK workflow

3. APK not attached to release
   - **Solution**: Verify workflow completed successfully

### Wrong version showing

**Possible causes:**
1. Version in code doesn't match build
   - **Solution**: Always use Build APK workflow (auto-updates version)

2. Old APK installed
   - **Solution**: Uninstall and reinstall from latest release

### APK download fails

**Possible causes:**
1. GitHub releases link broken
   - **Solution**: Check release page manually

2. Network issues
   - **Solution**: Try again later

## 🔒 Security Considerations

1. **GitHub API Rate Limiting:**
   - Unauthenticated: 60 requests/hour
   - App checks once per 24 hours
   - Safe for normal use

2. **APK Verification:**
   - APKs are from official GitHub releases
   - Built via GitHub Actions (verified)
   - Users should only download from releases page

3. **Update Opt-out:**
   - Users can tap "Later" to skip
   - No forced updates
   - Users control when to update

## 📊 Monitoring

### Check Update Adoption

Use GitHub release download counts:
1. Go to Releases page
2. Each release shows download count
3. Track adoption over time

### Analytics (Optional)

Could add:
- Update check success/failure logs
- Update installation tracking
- Version distribution analytics

## 🎯 Future Enhancements

Possible improvements:
1. **Force update**: For critical security fixes
2. **In-app download**: Download APK within app (requires storage permission)
3. **Update history**: Show changelog for all versions
4. **Beta channel**: Separate beta releases
5. **Auto-install**: Automatically install updates (requires root or special permissions)

## 📚 Related Documentation

- [FCM Setup Guide](FCM_SETUP.md) - Push notifications setup
- [Quick Start Guide](QUICKSTART.md) - Initial app setup
- [README](../README.md) - Full project documentation

## ❓ FAQ

**Q: How often does the app check for updates?**
A: Once every 24 hours automatically.

**Q: Can users disable update checks?**
A: Currently no, but checks are non-intrusive (once per day).

**Q: What happens if user skips an update?**
A: They'll see the update banner again after 24 hours.

**Q: Can we release hotfixes quickly?**
A: Yes! Run Build APK workflow with patch version (e.g., 1.0.1).

**Q: Do users need to uninstall to update?**
A: No, Android handles upgrades automatically if package name matches.

**Q: What if GitHub is down?**
A: Update check fails silently, users can still use the app normally.
