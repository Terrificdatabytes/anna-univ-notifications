/**
 * Update Notification Component
 * Shows a banner when app update is available
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import type {UpdateInfo} from './UpdateService';

interface UpdateNotificationProps {
  updateInfo: UpdateInfo;
  onDismiss: () => void;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  updateInfo,
  onDismiss,
}) => {
  const handleUpdate = () => {
    Alert.alert(
      'Update Available',
      `A new version (${updateInfo.latestVersion}) is available!\n\n${updateInfo.releaseNotes}\n\nYou will be redirected to download the APK.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Download',
          onPress: () => {
            Linking.openURL(updateInfo.downloadUrl).catch(err =>
              console.error('Error opening download URL:', err),
            );
          },
        },
      ],
    );
  };

  const handleDismiss = () => {
    Alert.alert(
      'Skip Update',
      'You can check for updates later from the app menu.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Skip',
          onPress: onDismiss,
          style: 'destructive',
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🎉 Update Available</Text>
        <Text style={styles.message}>
          Version {updateInfo.latestVersion} is ready to download
        </Text>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.dismissButton]}
          onPress={handleDismiss}>
          <Text style={styles.dismissText}>Later</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.updateButton]}
          onPress={handleUpdate}>
          <Text style={styles.updateText}>Update</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4CAF50',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  dismissButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  updateButton: {
    backgroundColor: '#FFFFFF',
  },
  dismissText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  updateText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default UpdateNotification;
