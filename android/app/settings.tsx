import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, useColorScheme, Platform, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { X, User, Bell, Crown, ShoppingBag } from 'lucide-react-native';
import { useGameContext } from '@/providers/GameProvider';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { currentUserName, updateUserProfile, isPro } = useGameContext();

  const [editedName, setEditedName] = useState(currentUserName);

  const handleSave = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    updateUserProfile(editedName.trim());
    Alert.alert('Success', 'Profile updated!');
  };

  const handleUpgradeToPro = () => {
    router.push('/paywall');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={[styles.closeButton, { backgroundColor: theme.secondary }]}>
          <X size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <User size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Profile</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.tabIconDefault }]}>Display Name</Text>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Enter your name"
              placeholderTextColor={theme.tabIconDefault}
            />
          </View>

          <Pressable 
            onPress={handleSave}
            style={[styles.button, { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.buttonText, { color: theme.background }]}>Save Changes</Text>
          </Pressable>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <Bell size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Notifications</Text>
          </View>
          
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>New Challenges</Text>
              <Text style={[styles.settingDesc, { color: theme.tabIconDefault }]}>Get notified when someone sends you a cap</Text>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Chain Updates</Text>
              <Text style={[styles.settingDesc, { color: theme.tabIconDefault }]}>Get notified about chain activity</Text>
            </View>
          </View>
        </View>

        {!isPro && (
          <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
              <Crown size={20} color="#FF4F00" />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Upgrade to Pro</Text>
            </View>
            
            <Text style={[styles.proDesc, { color: theme.tabIconDefault }]}>
              Unlock unlimited challenges, AI personalization, and advanced stats.
            </Text>

            <Pressable 
              onPress={handleUpgradeToPro}
              style={[styles.button, { backgroundColor: '#FF4F00' }]}
            >
              <Crown size={20} color="#000" />
              <Text style={[styles.buttonText, { color: '#000' }]}>Upgrade Now</Text>
            </Pressable>
          </View>
        )}

        {isPro && (
          <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
              <Crown size={20} color="#FF4F00" />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Pro Member</Text>
            </View>
            
            <Text style={[styles.proDesc, { color: theme.tabIconDefault }]}>
              You have unlimited access to all features! 🎉
            </Text>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <ShoppingBag size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Store</Text>
          </View>
          
          <Text style={[styles.proDesc, { color: theme.tabIconDefault }]}>
            Browse premium themes, animations, and sticker packs.
          </Text>

          <Pressable 
            onPress={() => router.push('/store')}
            style={[styles.button, { backgroundColor: theme.primary }]}
          >
            <ShoppingBag size={20} color={theme.background} />
            <Text style={[styles.buttonText, { color: theme.background }]}>Browse Store</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.tabIconDefault }]}>Version 1.0.0</Text>
          <Text style={[styles.footerText, { color: theme.tabIconDefault }]}>Made with 🔥 for the culture</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  section: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 100,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 14,
  },
  proDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  footerText: {
    fontSize: 12,
  },
});
