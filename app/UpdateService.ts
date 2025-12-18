/**
 * App Update Service
 * Checks for new app versions from GitHub releases
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const GITHUB_REPO_OWNER = 'Terrificdatabytes';
const GITHUB_REPO_NAME = 'anna-univ-notifications';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/latest`;
const LAST_UPDATE_CHECK_KEY = 'last_update_check';
const UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export interface AppVersion {
  versionCode: number;
  versionName: string;
}

export interface UpdateInfo {
  available: boolean;
  latestVersion: string;
  downloadUrl: string;
  releaseNotes: string;
  publishedAt: string;
}

export class UpdateService {
  // Current app version - should match build.gradle
  private static CURRENT_VERSION_CODE = 1;
  private static CURRENT_VERSION_NAME = '1.0';

  /**
   * Check if an update check is needed (only once per day)
   */
  static async shouldCheckForUpdate(): Promise<boolean> {
    try {
      const lastCheck = await AsyncStorage.getItem(LAST_UPDATE_CHECK_KEY);
      if (!lastCheck) {
        return true;
      }
      const lastCheckTime = parseInt(lastCheck, 10);
      const now = Date.now();
      return now - lastCheckTime > UPDATE_CHECK_INTERVAL;
    } catch (error) {
      console.error('Error checking update interval:', error);
      return true;
    }
  }

  /**
   * Save the last update check timestamp
   */
  private static async saveLastUpdateCheck(): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_UPDATE_CHECK_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error saving last update check:', error);
    }
  }

  /**
   * Parse version name to extract version code
   */
  private static parseVersionCode(versionName: string): number {
    // Extract version code from tag like "v1.2" or "1.2.3"
    const match = versionName.match(/(\d+)\.(\d+)(?:\.(\d+))?/);
    if (match) {
      const major = parseInt(match[1], 10);
      const minor = parseInt(match[2], 10);
      const patch = match[3] ? parseInt(match[3], 10) : 0;
      // Create version code: major * 10000 + minor * 100 + patch
      return major * 10000 + minor * 100 + patch;
    }
    return 0;
  }

  /**
   * Check for app updates from GitHub releases
   */
  static async checkForUpdate(): Promise<UpdateInfo | null> {
    try {
      const shouldCheck = await this.shouldCheckForUpdate();
      if (!shouldCheck) {
        console.log('Update check skipped - checked recently');
        return null;
      }

      console.log('Checking for app updates...');
      const response = await fetch(GITHUB_API_URL, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        console.error('Failed to check for updates:', response.status);
        return null;
      }

      const release = await response.json();

      // Save the check timestamp
      await this.saveLastUpdateCheck();

      // Parse the version from tag name (e.g., "v1.2" or "1.2")
      const latestVersionName = release.tag_name.replace(/^v/, '');
      const latestVersionCode = this.parseVersionCode(latestVersionName);

      console.log(
        `Current version: ${this.CURRENT_VERSION_NAME} (${this.CURRENT_VERSION_CODE})`,
      );
      console.log(
        `Latest version: ${latestVersionName} (${latestVersionCode})`,
      );

      // Find APK download URL from release assets
      const apkAsset = release.assets.find(
        (asset: any) =>
          asset.name.endsWith('.apk') &&
          asset.content_type === 'application/vnd.android.package-archive',
      );

      if (!apkAsset) {
        console.log('No APK found in latest release');
        return null;
      }

      // Check if update is available
      const updateAvailable = latestVersionCode > this.CURRENT_VERSION_CODE;

      if (updateAvailable) {
        console.log('✅ New version available!');
      } else {
        console.log('✅ App is up to date');
      }

      return {
        available: updateAvailable,
        latestVersion: latestVersionName,
        downloadUrl: apkAsset.browser_download_url,
        releaseNotes: release.body || 'No release notes available',
        publishedAt: release.published_at,
      };
    } catch (error) {
      console.error('Error checking for updates:', error);
      return null;
    }
  }

  /**
   * Get current app version
   */
  static getCurrentVersion(): AppVersion {
    return {
      versionCode: this.CURRENT_VERSION_CODE,
      versionName: this.CURRENT_VERSION_NAME,
    };
  }

  /**
   * Force an immediate update check (bypass interval)
   */
  static async forceCheckForUpdate(): Promise<UpdateInfo | null> {
    // Clear last check timestamp to force a new check
    await AsyncStorage.removeItem(LAST_UPDATE_CHECK_KEY);
    return this.checkForUpdate();
  }
}
