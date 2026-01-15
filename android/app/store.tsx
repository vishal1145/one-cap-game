import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, useColorScheme, Platform, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { X, Sparkles, Crown } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface StoreItem {
  id: string;
  title: string;
  description: string;
  price: string;
  type: 'theme' | 'animation' | 'sticker';
  preview: string;
  isPremium?: boolean;
}

const STORE_ITEMS: StoreItem[] = [
  {
    id: 'theme-dark-mode',
    title: 'Dark Vibes Theme',
    description: 'Sleek midnight aesthetic',
    price: '$0.99',
    type: 'theme',
    preview: '🌙',
  },
  {
    id: 'theme-neon',
    title: 'Neon Nights',
    description: 'Cyberpunk energy',
    price: '$0.99',
    type: 'theme',
    preview: '⚡',
  },
  {
    id: 'theme-pastel',
    title: 'Soft Pastels',
    description: 'Cute & clean vibes',
    price: '$0.99',
    type: 'theme',
    preview: '🌸',
  },
  {
    id: 'animation-fire',
    title: 'Fire Reveal',
    description: 'Reveal animation with flames',
    price: '$1.99',
    type: 'animation',
    preview: '🔥',
  },
  {
    id: 'animation-confetti',
    title: 'Confetti Burst',
    description: 'Celebration animation',
    price: '$1.99',
    type: 'animation',
    preview: '🎉',
  },
  {
    id: 'sticker-pack-1',
    title: 'Emoji Reactions',
    description: '50 unique reactions',
    price: '$2.99',
    type: 'sticker',
    preview: '😎',
  },
  {
    id: 'theme-pro-bundle',
    title: 'Pro Theme Bundle',
    description: '10 exclusive themes',
    price: '$4.99',
    type: 'theme',
    preview: '✨',
    isPremium: true,
  },
];

export default function StoreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [selectedTab, setSelectedTab] = useState<'all' | 'themes' | 'animations' | 'stickers'>('all');

  const filteredItems = STORE_ITEMS.filter(item => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'themes') return item.type === 'theme';
    if (selectedTab === 'animations') return item.type === 'animation';
    if (selectedTab === 'stickers') return item.type === 'sticker';
    return true;
  });

  const handlePurchase = async (item: StoreItem) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      'Purchase',
      `Buy ${item.title} for ${item.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy',
          onPress: async () => {
            if (Platform.OS !== 'web') {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            Alert.alert('Success!', `${item.title} purchased! 🎉`);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable onPress={() => router.back()} style={[styles.closeButton, { backgroundColor: theme.secondary }]}>
          <X size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Store</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabs}>
        {(['all', 'themes', 'animations', 'stickers'] as const).map(tab => (
          <Pressable
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={[
              styles.tab,
              {
                backgroundColor: selectedTab === tab ? theme.primary : theme.secondary,
                borderColor: selectedTab === tab ? theme.primary : theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: selectedTab === tab ? theme.background : theme.text },
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {filteredItems.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={Platform.OS === 'web' ? undefined : FadeInDown.delay(index * 50)}
              style={[styles.itemCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.preview}>{item.preview}</Text>
                {item.isPremium && (
                  <View style={[styles.premiumBadge, { backgroundColor: '#FF4F00' }]}>
                    <Crown size={10} color="#000" fill="#000" />
                  </View>
                )}
              </View>
              <Text style={[styles.itemTitle, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.itemDesc, { color: theme.tabIconDefault }]}>{item.description}</Text>
              <Pressable
                onPress={() => handlePurchase(item)}
                style={[styles.buyButton, { backgroundColor: theme.primary }]}
              >
                <Text style={[styles.buyButtonText, { color: theme.background }]}>{item.price}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <View style={[styles.proSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Sparkles size={32} color="#FF4F00" />
          <Text style={[styles.proTitle, { color: theme.text }]}>Get Everything with Pro</Text>
          <Text style={[styles.proDesc, { color: theme.tabIconDefault }]}>
            Unlock all themes, animations, and stickers instantly with a Pro subscription.
          </Text>
          <Pressable
            onPress={() => router.push('/paywall')}
            style={[styles.proButton, { backgroundColor: '#FF4F00' }]}
          >
            <Crown size={20} color="#000" />
            <Text style={styles.proButtonText}>Upgrade to Pro</Text>
          </Pressable>
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    gap: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  itemCard: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  preview: {
    fontSize: 40,
  },
  premiumBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDesc: {
    fontSize: 12,
    flex: 1,
  },
  buyButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  buyButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  proSection: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  proTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  proDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  proButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 100,
    gap: 8,
    marginTop: 8,
  },
  proButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});
