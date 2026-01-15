import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, useColorScheme, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { ArrowRight, Flame, Link as LinkIcon, ChevronRight, Zap, Crown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useGameContext } from '@/providers/GameProvider';

const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

const getChainStatus = (lastActive: number): 'hot' | 'active' | 'dying' => {
  const hoursSinceActive = (Date.now() - lastActive) / (1000 * 60 * 60);
  if (hoursSinceActive < 2) return 'hot';
  if (hoursSinceActive < 12) return 'active';
  return 'dying';
};

export default function ChainsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { chains, currentUserName, boostChain, isPro } = useGameContext();

  const totalLinks = chains.reduce((sum, chain) => sum + chain.games.length, 0);

  const handleBoost = (e: any, chainId: string) => {
    e.preventDefault();
    if (!isPro) {
      router.push('/paywall');
      return; 
    }
    boostChain(chainId);
  };

  const handleChainPress = (gameId: string) => {
    router.push(`/game/${gameId}`);
  };

  const renderChain = ({ item, index }: { item: typeof chains[0], index: number }) => {
    const status = getChainStatus(item.lastActive);
    const starterName = item.starterName === currentUserName ? 'You' : item.starterName;
    
    return (
    <Animated.View entering={Platform.OS === 'web' ? undefined : FadeInDown.delay(index * 100).springify()}>
      <Pressable 
        onPress={() => handleChainPress(item.games[item.games.length - 1])}
        style={({ pressed }) => [
          styles.chainCard,
          { 
            backgroundColor: theme.card,
            borderColor: theme.border,
            transform: [{ scale: pressed ? 0.98 : 1 }]
          }
        ]}
      >
        <View style={styles.chainHeader}>
          <View style={[styles.avatarContainer, { borderColor: theme.border }]}>
             <View style={[styles.avatar, { backgroundColor: theme.primary, zIndex: 3 }]}>
               <Text style={[styles.avatarText, { color: theme.background }]}>{item.starterName[0].toUpperCase()}</Text>
               {item.starterIsPro && (
                 <View style={styles.proBadge}>
                   <Crown size={10} color="#000" fill="#000" />
                 </View>
               )}
             </View>
             {item.participants.length > 1 && (
               <View style={[styles.avatarStack, { backgroundColor: theme.secondary, left: 24, zIndex: 2, borderColor: theme.card }]}>
                  <Text style={[styles.stackText, { color: theme.tabIconDefault }]}>
                    {item.participants.length}
                  </Text>
               </View>
             )}
          </View>
          
          <View style={styles.chainInfo}>
            <View style={styles.titleRow}>
              <Text style={[styles.chainTitle, { color: theme.text }]}>
                {starterName}&apos;s {item.theme} Chain
              </Text>
              {status === 'hot' && <Flame size={16} color={theme.danger} fill={theme.danger} />}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginRight: 8 }}>
               <Text style={[styles.chainMeta, { color: theme.tabIconDefault }]}>
                 {item.games.length} links • Active {formatTimeAgo(item.lastActive)}
               </Text>
               {status === 'dying' && (
                 <Pressable 
                   onPress={(e) => handleBoost(e, item.id)}
                   style={({ pressed }) => [
                     styles.boostButton, 
                     { backgroundColor: isPro ? theme.primary : theme.secondary, opacity: pressed ? 0.7 : 1 }
                   ]}
                 >
                    <Zap size={12} color={isPro ? theme.background : theme.text} fill={isPro ? theme.background : 'transparent'} />
                    <Text style={[styles.boostText, { color: isPro ? theme.background : theme.text }]}>
                      {isPro ? 'BOOST' : 'PRO'}
                    </Text>
                 </Pressable>
               )}
            </View>
          </View>

          <ChevronRight size={20} color={theme.tabIconDefault} />
        </View>
        
        {/* Chain Visualizer Line */}
        <View style={styles.visualizerContainer}>
          <View style={[styles.line, { backgroundColor: theme.border }]} />
          <View style={[styles.node, { backgroundColor: theme.primary }]} />
          <View style={[styles.node, { backgroundColor: theme.text, left: '33%' }]} />
          <View style={[styles.node, { backgroundColor: theme.text, left: '66%' }]} />
          <View style={[styles.node, { backgroundColor: status === 'dying' ? theme.danger : theme.accent, right: 0 }]} />
        </View>
        </Pressable>
      
    </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
       <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Viral Chains</Text>
        <Pressable style={[styles.headerButton, { backgroundColor: theme.secondary }]}>
          <LinkIcon size={20} color={theme.text} />
        </Pressable>
      </View>
      
      <FlatList
        data={chains}
        renderItem={renderChain}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          chains.length > 0 ? (
            <View style={[styles.statsContainer, { backgroundColor: theme.surface }]}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.text }]}>{totalLinks}</Text>
                <Text style={[styles.statLabel, { color: theme.tabIconDefault }]}>Total Links</Text>
              </View>
              <View style={[styles.verticalDivider, { backgroundColor: theme.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.text }]}>{chains.length}</Text>
                <Text style={[styles.statLabel, { color: theme.tabIconDefault }]}>Active Chains</Text>
              </View>
              <View style={[styles.verticalDivider, { backgroundColor: theme.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.danger }]}>🔥</Text>
                <Text style={[styles.statLabel, { color: theme.tabIconDefault }]}>On Fire</Text>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emoji]}>🔗</Text>
            <Text style={[styles.title, { color: theme.text }]}>No Chains Yet</Text>
            <Text style={[styles.subtitle, { color: theme.tabIconDefault }]}>
              Create a cap and share it with friends to start a chain reaction.
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/create')} style={StyleSheet.flatten([styles.button, { backgroundColor: theme.accent }])}>
               <Text style={[styles.buttonText, { color: '#000' }]}>Start a Chain</Text>
               <ArrowRight size={20} color="#000" />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 20,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  verticalDivider: {
    width: 1,
    height: '100%',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  chainCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    gap: 16,
  },
  chainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 50,
    height: 40, 
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
  },
  proBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FF4F00',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#000',
  },
  avatarStack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    borderWidth: 2,
  },
  avatarText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  stackText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  chainInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  chainTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chainMeta: {
    fontSize: 13,
  },
  boostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  boostText: {
    fontSize: 10,
    fontWeight: '800',
  },
  visualizerContainer: {
    height: 12,
    position: 'relative',
    justifyContent: 'center',
    marginTop: 8,
  },
  line: {
    height: 2,
    width: '100%',
    borderRadius: 2,
  },
  node: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    top: 0,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 24,
    marginTop: 20,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
    gap: 8,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
