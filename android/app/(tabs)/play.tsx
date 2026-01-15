import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Play, Clock, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useGameContext } from '@/providers/GameProvider';

const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
};

export default function PlayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { receivedGames, gameResults, receiveGame } = useGameContext();

  const playedGameIds = new Set(gameResults.map(r => r.gameId));
  const unplayedGames = receivedGames.filter(g => !playedGameIds.has(g.id));

  const addTestGame = () => {
    const testRounds = Array.from({ length: 5 }).map((_, i) => ({
      id: `test-r${i + 1}-${Date.now()}`,
      statements: [
        { id: `ts${i * 3 + 1}`, text: `Statement ${i * 3 + 1} is true`, isLie: false },
        { id: `ts${i * 3 + 2}`, text: `Statement ${i * 3 + 2} is false`, isLie: true },
        { id: `ts${i * 3 + 3}`, text: `Statement ${i * 3 + 3} is true`, isLie: false },
      ]
    }));
    
    const names = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey'];
    const themes = ['Random', 'Friends', 'Work', 'Travel'];
    
    receiveGame({
      id: `test-${Date.now()}`,
      rounds: testRounds,
      authorId: 'test-friend',
      authorName: names[Math.floor(Math.random() * names.length)],
      createdAt: Date.now(),
      theme: themes[Math.floor(Math.random() * themes.length)],
    });
  };

  const handleGamePress = (gameId: string) => {
    router.push(`/game/${gameId}`);
  };

  const renderItem = ({ item }: { item: typeof receivedGames[0] }) => (
    <Pressable 
      onPress={() => handleGamePress(item.id)}
      style={({ pressed }) => StyleSheet.flatten([
        styles.card, 
        { 
          backgroundColor: theme.card,
          borderColor: theme.border,
          transform: [{ scale: pressed ? 0.98 : 1 }]
        }
      ])}
    >
      <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={[styles.avatarText, { color: theme.background }]}>{item.authorName[0].toUpperCase()}</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{item.authorName}&apos;s Cap</Text>
            <View style={styles.badgeContainer}>
              <Clock size={12} color={theme.tabIconDefault} />
              <Text style={[
                styles.badgeText, 
                { color: theme.tabIconDefault }
              ]}>
                {formatTimeAgo(item.createdAt)}
              </Text>
            </View>
          </View>
          <View style={[styles.playButton, { backgroundColor: theme.accent }]}>
            <Play size={20} color="#000" fill="#000" />
          </View>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>One Cap!</Text>
          <Text style={[styles.headerSubtitle, { color: theme.tabIconDefault }]}>Spot the lie. Don&apos;t choke.</Text>
        </View>
        <Pressable 
          onPress={addTestGame}
          style={[styles.addButton, { backgroundColor: theme.secondary }]}
        >
          <Plus size={20} color={theme.text} />
        </Pressable>
      </View>

      <FlatList
        data={unplayedGames}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.tabIconDefault }]}>No active caps.</Text>
            <Pressable onPress={() => router.push('/(tabs)/create')} style={StyleSheet.flatten([styles.ctaButton, { backgroundColor: theme.primary }])}>
              <Text style={[styles.ctaText, { color: theme.background }]}>Start a Fire</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    gap: 20,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
  },
  ctaButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
