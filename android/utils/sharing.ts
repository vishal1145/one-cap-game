import { Share, Platform, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';

export interface ShareOptions {
  gameId: string;
  authorName: string;
  theme?: string;
}

const generateShareLink = (gameId: string): string => {
  // Using /game/ to match the app/game/[id].tsx route
  return `https://onecap.app/game/${gameId}`;
};

const generateShareText = (authorName: string, theme?: string): string => {
  const themeText = theme ? ` about ${theme}` : '';
  return `${authorName} sent you a One Cap challenge${themeText}!\n\n3 statements. 1 lie.\nCan you spot the CAP?\n\nTap to play:`;
};

export const shareToWhatsApp = async (options: ShareOptions): Promise<boolean> => {
  try {
    const shareText = `${generateShareText(options.authorName, options.theme)}\n${generateShareLink(options.gameId)}`;
    
    if (Platform.OS === 'web') {
      const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(url, '_blank');
      return true;
    }

    const canOpen = await Sharing.isAvailableAsync();
    
    if (canOpen) {
      await Share.share({
        message: shareText,
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('WhatsApp share error:', error);
    return false;
  }
};

export const shareToSMS = async (options: ShareOptions): Promise<boolean> => {
  try {
    const shareText = `${generateShareText(options.authorName, options.theme)}\n${generateShareLink(options.gameId)}`;
    
    if (Platform.OS === 'web') {
      Alert.alert('SMS not available', 'SMS sharing is only available on mobile devices');
      return false;
    }

    await Share.share({
      message: shareText,
    });
    return true;
  } catch (error) {
    console.error('SMS share error:', error);
    return false;
  }
};

export const shareToInstagramStory = async (options: ShareOptions): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      Alert.alert('Instagram not available', 'Instagram Stories sharing is only available on mobile devices');
      return false;
    }

    const shareText = `${generateShareText(options.authorName, options.theme)}\n${generateShareLink(options.gameId)}`;
    await Share.share({
      message: shareText,
    });
    return true;
  } catch (error) {
    console.error('Instagram share error:', error);
    return false;
  }
};

export const shareGeneric = async (options: ShareOptions): Promise<boolean> => {
  try {
    const shareText = `${generateShareText(options.authorName, options.theme)}\n${generateShareLink(options.gameId)}`;
    
    const result = await Share.share({
      message: shareText,
      title: 'One Cap Challenge',
    });

    if (result.action === Share.sharedAction) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Generic share error:', error);
    return false;
  }
};

export const showShareSheet = (options: ShareOptions) => {
  if (Platform.OS === 'web') {
    shareGeneric(options);
    return;
  }

  Alert.alert(
    'Share Your Cap',
    'Choose how to share',
    [
      {
        text: 'WhatsApp',
        onPress: () => shareToWhatsApp(options),
      },
      {
        text: 'SMS',
        onPress: () => shareToSMS(options),
      },
      {
        text: 'Instagram Story',
        onPress: () => shareToInstagramStory(options),
      },
      {
        text: 'More...',
        onPress: () => shareGeneric(options),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ],
    { cancelable: true }
  );
};
