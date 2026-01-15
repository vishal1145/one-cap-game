import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Settings, Award, Flame, Zap, Crown } from 'lucide-react-native';
import { useGameContext } from '@/providers/GameProvider';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { currentUserName, getStreakDays, getAccuracy, chains, sentGames, isPro } = useGameContext();

  const streak = getStreakDays();
  const accuracy = getAccuracy();

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View />
        <Pressable onPress={() => router.push('/settings')}>
          <Settings size={24} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: theme.secondary }]}>
            <Text style={[styles.avatarText, { color: theme.text }]}>{currentUserName.slice(0, 2).toUpperCase()}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.name, { color: theme.text }]}>{currentUserName}</Text>
            {isPro && (
              <View style={[styles.proBadge, { backgroundColor: '#FF4F00' }]}>
                <Crown size={14} color="#000" fill="#000" />
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            )}
          </View>
          <Text style={[styles.handle, { color: theme.tabIconDefault }]}>@{currentUserName.toLowerCase().replace(/\s/g, '')}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Flame size={24} color={theme.danger} />
            <Text style={[styles.statValue, { color: theme.text }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: theme.tabIconDefault }]}>Streak</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Award size={24} color={theme.accent} />
            <Text style={[styles.statValue, { color: theme.text }]}>{accuracy}%</Text>
            <Text style={[styles.statLabel, { color: theme.tabIconDefault }]}>Accuracy</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Zap size={24} color="#FFD700" />
            <Text style={[styles.statValue, { color: theme.text }]}>{chains.length}</Text>
            <Text style={[styles.statLabel, { color: theme.tabIconDefault }]}>Chains</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Caps</Text>
          {sentGames.length > 0 ? (
            sentGames.slice(0, 5).map(game => (
              <View key={game.id} style={[styles.historyItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View>
                  <Text style={[styles.historyText, { color: theme.text }]}>{game.theme || 'Random'} Cap</Text>
                  <Text style={[styles.historySubtext, { color: theme.tabIconDefault }]}>{game.rounds.length} rounds</Text>
                </View>
                <Text style={[styles.historyDate, { color: theme.tabIconDefault }]}>
                  {new Date(game.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: theme.tabIconDefault }]}>No caps yet. Create your first!</Text>
          )}
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
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  content: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  handle: {
    fontSize: 16,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  historyItem: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  historySubtext: {
    fontSize: 14,
    marginTop: 2,
  },
  historyDate: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  proBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000',
  },
});
