import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { X, CheckCircle, XCircle, Share, ArrowRight, Trophy, AlertTriangle, Heart, ThumbsUp, File } from 'lucide-react-native';
import Animated, { FadeInDown, useSharedValue, withTiming, ZoomIn, Layout, withDelay, withRepeat, withSequence, useAnimatedStyle } from 'react-native-reanimated';
import { useGameContext, Statement } from '@/providers/GameProvider';
import { showShareSheet } from '@/utils/sharing';
import * as Haptics from 'expo-haptics';
import { Confetti } from '@/components/Confetti';
import { MegaReveal } from '@/components/MegaReveal';
import { Image } from 'expo-image';
import { trpc } from '@/utils/trpc';


const REACTIONS = [
  { emoji: '🔥', label: 'Fire', icon: File },
  { emoji: '😂', label: 'LOL' },
  { emoji: '👏', label: 'Nice', icon: ThumbsUp },
  { emoji: '❤️', label: 'Love', icon: Heart },
];

export default function GameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getGame, recordGameResult, currentUserName, receiveGame } = useGameContext();
  
  // Try to get game from local state first
  const localGame = getGame(id || '');
  
  // If not found locally, fetch from backend
  const { data: remoteGame, isLoading, error } = trpc.games.get.useQuery(
    { id: id || '' },
    { 
      enabled: !!id && !localGame, // Only fetch if we have an ID and don't have the game locally
      refetchOnWindowFocus: false 
    }
  );

  // Use either local or remote game
  const gameData = localGame || remoteGame;
  
  // If we fetched a remote game, save it to local state so we have it
  useEffect(() => {
    if (remoteGame && !localGame) {
      receiveGame(remoteGame);
    }
  }, [remoteGame, localGame, receiveGame]);

  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [roundState, setRoundState] = useState<'GUESSING' | 'REVEALED' | 'FINISHED'>('GUESSING');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const [showConfetti, setShowConfetti] = useState(false);
  const [showMegaReveal, setShowMegaReveal] = useState(false);

  const overlayOpacity = useSharedValue(0);
  const fireScale = useSharedValue(1);

  // Animate Fireball Hint/Icon after 2 seconds
  useEffect(() => {
    fireScale.value = withDelay(
      2000,
      withRepeat(
        withSequence(
           withTiming(1.2, { duration: 200 }),
           withTiming(1.0, { duration: 200 }),
           withTiming(1.2, { duration: 200 }),
           withTiming(1.0, { duration: 200 }),
           withDelay(3000, withTiming(1, { duration: 0 }))
        ),
        -1
      )
    );
  }, [fireScale]);

  const fireStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fireScale.value }]
  }));

  useEffect(() => {
    if (roundState === 'GUESSING') {
      overlayOpacity.value = 0;
      setSelectedId(null);
    }
  }, [currentRoundIndex, roundState, overlayOpacity]);
  
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.instruction, { color: theme.text, fontSize: 18, marginTop: 20 }]}>Loading Game...</Text>
      </View>
    );
  }

  if (!gameData || error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.instruction, { color: theme.text }]}>
          {error ? 'Could not load game' : 'Game not found'}
        </Text>
        <Pressable onPress={() => router.back()} style={[styles.actionButton, { backgroundColor: theme.primary }]}>
          <Text style={[styles.actionButtonText, { color: theme.background }]}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const currentRound = gameData.rounds[currentRoundIndex];
  const isLastRound = currentRoundIndex === gameData.rounds.length - 1;

  const handleGuess = async (statementId: string, isLie: boolean) => {
    if (roundState !== 'GUESSING') return;
    
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(
        isLie ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light
      );
    }
    
    setSelectedId(statementId);
    setRoundState('REVEALED');
    setIsCorrect(isLie);
    
    if (isLastRound && isLie) {
        if (gameData.revealStyle === 'mega') {
          setShowMegaReveal(true);
        } else {
          setShowConfetti(true);
        }
    }

    if (isLie) {
      setScore(s => s + 1);
    }

    overlayOpacity.value = withTiming(1, { duration: 300 });

    setTimeout(() => {
      if (isLastRound) {
        recordGameResult({
          gameId: gameData.id,
          score: isLie ? score + 1 : score,
          totalRounds: gameData.rounds.length,
          playedAt: Date.now(),
          authorName: gameData.authorName,
        });
        setRoundState('FINISHED');
      } else {
        advanceRound();
      }
    }, 2000);
  };

  const advanceRound = () => {
    setRoundState('GUESSING');
    setCurrentRoundIndex(prev => prev + 1);
  };

  const closeGame = () => {
    router.back();
  };

  const handleReaction = async (reaction: string) => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    console.log('Sent reaction:', reaction, 'to', gameData.authorName);
    setShowReactions(false);
    Alert.alert('Reaction Sent!', `${reaction} sent to ${gameData.authorName}`);
  };

  const handleShareScore = () => {
    const scorePercent = Math.round((score / gameData.rounds.length) * 100);
    showShareSheet({
      gameId: gameData.id,
      authorName: currentUserName,
      theme: `Got ${score}/${gameData.rounds.length} (${scorePercent}%) on ${gameData.authorName}'s Cap!`,
    });
  };

  if (roundState === 'FINISHED') {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
           <Pressable onPress={closeGame} style={[styles.closeButton, { backgroundColor: theme.secondary }]}>
            <X size={24} color={theme.text} />
          </Pressable>
        </View>

        <View style={styles.resultsContainer}>
          <Animated.View entering={Platform.OS === 'web' ? undefined : ZoomIn.springify()} style={styles.scoreCircle}>
             <Trophy size={64} color={theme.primary} fill={theme.primary} />
             <Text style={[styles.scoreText, { color: theme.text }]}>{score}/{gameData.rounds.length}</Text>
             <Text style={[styles.scoreLabel, { color: theme.tabIconDefault }]}>CORRECT GUESSES</Text>
          </Animated.View>

          <Text style={[styles.resultMessage, { color: theme.text }]}>
            {score === gameData.rounds.length ? "NO CAP! YOU'RE A LEGEND!" : 
             score >= 3 ? "NOT BAD! PRETTY SUS." : 
             "YOU GOT CAPPED HARD."}
          </Text>

          {!showReactions ? (
            <View style={styles.resultActions}>
               <Pressable 
                 onPress={() => setShowReactions(true)}
                 style={[styles.actionButton, { backgroundColor: theme.secondary, width: '100%' }]}
               >
                  <Text style={[styles.actionButtonText, { color: theme.text }]}>Send Reaction to {gameData.authorName}</Text>
                  <Heart size={20} color={theme.text} />
               </Pressable>

               <Pressable 
                 onPress={handleShareScore}
                 style={[styles.actionButton, { backgroundColor: theme.primary, width: '100%' }]}
               >
                  <Text style={[styles.actionButtonText, { color: theme.background }]}>Share Score</Text>
                  <Share size={20} color={theme.background} />
               </Pressable>
               
               <Pressable 
                  onPress={() => router.replace('/(tabs)/create')} 
                  style={[styles.actionButton, { backgroundColor: theme.accent, width: '100%' }]}
                >
                  <Text style={[styles.actionButtonText, { color: '#000' }]}>Revenge Cap</Text>
                  <ArrowRight size={20} color="#000" />
               </Pressable>
            </View>
          ) : (
            <Animated.View entering={Platform.OS === 'web' ? undefined : FadeInDown.springify()} style={styles.reactionsContainer}>
              <Text style={[styles.reactionsTitle, { color: theme.text }]}>Choose a reaction:</Text>
              <View style={styles.reactionsGrid}>
                {REACTIONS.map((reaction, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => handleReaction(reaction.emoji)}
                    style={[styles.reactionButton, { backgroundColor: theme.card, borderColor: theme.border }]}
                  >
                    <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                    <Text style={[styles.reactionLabel, { color: theme.text }]}>{reaction.label}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable onPress={() => setShowReactions(false)} style={{ marginTop: 16 }}>
                <Text style={[styles.cancelText, { color: theme.tabIconDefault }]}>Cancel</Text>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </View>
    );
  }

  // --- RENDER GAME ROUND ---
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.progressBarContainer}>
           <View style={[styles.headerTopRow]}>
             <View style={styles.capIconContainer}>
               <Animated.View style={fireStyle}>
                 <Image 
                   source={{ uri: "https://r2-pub.rork.com/generated-images/ca803866-6b41-4386-8104-fa84310d87eb.png" }}
                   style={{ width: 32, height: 32 }}
                   contentFit="contain"
                 />
               </Animated.View>
               <Text style={[styles.roundIndicator, { color: theme.tabIconDefault }]}>
                 ROUND {currentRoundIndex + 1}/{gameData.rounds.length}
               </Text>
             </View>
           </View>
           <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
             <Animated.View 
               style={{
                 ...styles.progressFill,
                 backgroundColor: theme.primary,
                 width: `${((currentRoundIndex) / gameData.rounds.length) * 100}%` 
               }} 
             />
           </View>
           <Text style={[styles.roundIndicator, { color: theme.tabIconDefault }]}>
             ROUND {currentRoundIndex + 1}/{gameData.rounds.length}
           </Text>
        </View>
        
        <Pressable onPress={closeGame} style={[styles.closeButton, { backgroundColor: theme.secondary }]}>
          <X size={24} color={theme.text} />
        </Pressable>
      </View>

      {/* Game Board */}
      <View style={styles.board}>
        <Text style={[styles.instruction, { color: theme.text }]}>
           Tap the lie.
        </Text>
        
        <View style={styles.cardsContainer}>
          {currentRound.statements.map((statement: Statement, index: number) => {
            const isSelected = selectedId === statement.id;
            const showResult = roundState === 'REVEALED';
            
            let cardBorderColor: string = theme.border;
            let cardBgColor: string = theme.card;
            
            if (showResult) {
               if (statement.isLie) {
                 // This is the lie
                 cardBorderColor = theme.accent;
                 cardBgColor = 'rgba(255, 79, 0, 0.1)';
               } else if (isSelected && !statement.isLie) {
                 // User selected this, but it was truth (wrong guess)
                 cardBorderColor = theme.danger;
                 cardBgColor = 'rgba(255, 59, 48, 0.1)';
               }
            }

            return (
              <Animated.View 
                key={statement.id}
                entering={Platform.OS === 'web' ? undefined : FadeInDown.delay(index * 100).springify()}
                // Force re-render animation when round changes
                layout={Platform.OS !== 'web' ? Layout.springify() : undefined}
              >
                <Pressable
                  onPress={() => handleGuess(statement.id, statement.isLie)}
                  disabled={roundState !== 'GUESSING'}
                  style={({ pressed }) => [
                    styles.card,
                    { 
                      borderColor: cardBorderColor,
                      backgroundColor: cardBgColor,
                      transform: [{ scale: pressed ? 0.98 : 1 }]
                    }
                  ]}
                >
                  <Text style={[styles.cardText, { color: theme.text }]}>{statement.text}</Text>
                  
                  {showResult && statement.isLie && (
                     <View style={styles.resultIcon}>
                        <CheckCircle size={24} color={theme.accent} fill="black" />
                     </View>
                  )}
                   {showResult && !statement.isLie && isSelected && (
                     <View style={styles.resultIcon}>
                        <XCircle size={24} color={theme.danger} fill="white" />
                     </View>
                  )}
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </View>

      {/* Result Overlay (Toast) */}
      {showConfetti && <Confetti />}
      {showMegaReveal && <MegaReveal onComplete={() => setShowMegaReveal(false)} />}
      {roundState === 'REVEALED' && (
         <Animated.View 
           entering={Platform.OS === 'web' ? undefined : FadeInDown.springify()} 
           style={{
             ...styles.toastContainer,
             bottom: insets.bottom + 40 
           }}
         >
            <View style={[styles.toast, { backgroundColor: isCorrect ? theme.success : theme.danger }]}>
               {isCorrect ? <CheckCircle color="#FFF" size={24} /> : <AlertTriangle color="#FFF" size={24} />}
               <Text style={styles.toastText}>
                 {isCorrect ? 'GOOD EYE!' : 'YOU GOT CAPPED!'}
               </Text>
            </View>
         </Animated.View>
      )}
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
    gap: 16,
  },
  progressBarContainer: {
    flex: 1,
    gap: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  capIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  roundIndicator: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingBottom: 100, 
  },
  instruction: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 36,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 100,
  },
  cardText: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  resultIcon: {
    marginLeft: 12,
  },
  toastContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 8,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: '900',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  resultMessage: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 32,
  },
  resultActions: {
    width: '100%',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 100,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reactionsContainer: {
    width: '100%',
    gap: 20,
    alignItems: 'center',
  },
  reactionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  reactionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  reactionButton: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reactionEmoji: {
    fontSize: 32,
  },
  reactionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
