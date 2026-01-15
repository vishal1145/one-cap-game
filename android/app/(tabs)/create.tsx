import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Platform, useColorScheme, KeyboardAvoidingView, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Send, Users, Heart, Plane, BookOpen, Briefcase, Lock, Dice5, RefreshCcw, Crown, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInRight, FadeInUp, Layout } from 'react-native-reanimated';
import { useGameContext } from '@/providers/GameProvider';
import { showShareSheet } from '@/utils/sharing';
import * as Haptics from 'expo-haptics';
import { generateObject } from '@rork-ai/toolkit-sdk';
import { z } from 'zod';

// Vibe Configuration
const VIBES = [
  { id: 'standard', label: 'Standard', emoji: '😐' },
  { id: 'hard', label: 'Hard Mode', emoji: '🤯' },
  { id: 'funny', label: 'Funny', emoji: '😂' },
  { id: 'spicy', label: 'Spicy', emoji: '🌶️' },
];

// Themes Configuration
const THEMES = [
  { id: 'random', label: 'Random', icon: Dice5, color: '#FF4F00' },
  { id: 'friends', label: 'Friends', icon: Users, color: '#FF9500' },
  { id: 'relationships', label: 'Dating', icon: Heart, color: '#FF2D55' },
  { id: 'travel', label: 'Travel', icon: Plane, color: '#5AC8FA' },
  { id: 'school', label: 'School', icon: BookOpen, color: '#AF52DE' },
  { id: 'work', label: 'Work', icon: Briefcase, color: '#5856D6' },
  { id: 'confessions', label: 'Secrets', icon: Lock, color: '#FF3B30' },
];

// Mock Data Generators
const TEMPLATES = [
  [
    { text: "I've never broken a bone", isLie: false },
    { text: "I speak three languages", isLie: true },
    { text: "I can juggle", isLie: false },
  ],
  [
    { text: "I own 50+ pairs of shoes", isLie: true },
    { text: "I've met a celebrity", isLie: false },
    { text: "I hate chocolate", isLie: false },
  ],
  [
    { text: "I've been skydiving", isLie: false },
    { text: "I have a twin", isLie: true },
    { text: "I can't swim", isLie: false },
  ],
  [
    { text: "I've eaten shark", isLie: false },
    { text: "I've never been on a plane", isLie: true },
    { text: "I love horror movies", isLie: false },
  ],
  [
    { text: "I ran a marathon", isLie: true },
    { text: "I have 2 dogs", isLie: false },
    { text: "I was born in July", isLie: false },
  ],
  [
    { text: "I can play guitar", isLie: false },
    { text: "I've never seen Star Wars", isLie: true },
    { text: "I drink coffee black", isLie: false },
  ],
];

const GameSchema = z.object({
  rounds: z.array(z.object({
    statements: z.array(z.object({
      text: z.string(),
      isLie: z.boolean(),
    })).length(3)
  })).length(5)
});

const generateRound = (id: string) => {
  const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  // Deep copy and shuffle statements within the round
  const statements = [...template]
    .sort(() => Math.random() - 0.5)
    .map((s, idx) => ({ ...s, id: `${id}-s${idx}` }));
    
  return {
    id,
    statements,
  };
};

const generateGame = () => {
  return Array.from({ length: 5 }).map((_, i) => generateRound(`r${i + 1}`));
};

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { createGame, currentUserName, canCreateGame, isPro, getRemainingGames } = useGameContext();
  const router = useRouter();
  
  const [selectedThemeId, setSelectedThemeId] = useState('random');
  const [selectedVibeId, setSelectedVibeId] = useState('standard');
  const [revealStyle, setRevealStyle] = useState<'standard' | 'mega'>('standard');
  const [rounds, setRounds] = useState(generateGame());
  const [isGenerating, setIsGenerating] = useState(false);

  const regenerateAll = useCallback(async () => {
    if (!isPro) {
       router.push('/paywall');
       return;
    }
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsGenerating(true);
    const selectedTheme = THEMES.find(t => t.id === selectedThemeId);
    const selectedVibe = VIBES.find(v => v.id === selectedVibeId);
    
    try {
      const result = await generateObject({
        messages: [{
          role: 'user',
          content: `Generate a "Two Truths and a Lie" game with 5 rounds.
          Theme: ${selectedTheme?.label || 'Random'}.
          Vibe: ${selectedVibe?.label || 'Standard'}.
          For each round, provide 3 statements where exactly one is a lie (isLie: true).
          Make the statements short, fun, engaging, and suitable for social media.
          Target audience: Gen Z.
          ${selectedVibeId === 'hard' ? 'Make the lie very subtle and hard to spot.' : ''}
          ${selectedVibeId === 'funny' ? 'Make the statements hilarious and absurd.' : ''}
          ${selectedVibeId === 'spicy' ? 'Make the statements a bit edgy or controversial (but safe).' : ''}
          Avoid sensitive or controversial topics unless "Spicy" vibe is selected (keep it PG-13).`
        }],
        schema: GameSchema
      });

      const newRounds = result.rounds.map((r, rIdx) => ({
        id: `r${rIdx + 1}`,
        statements: r.statements.map((s, sIdx) => ({
          id: `r${rIdx + 1}-s${sIdx}`,
          text: s.text,
          isLie: s.isLie
        }))
      }));

      setRounds(newRounds);
    } catch (error) {
      console.error('AI Generation failed:', error);
      Alert.alert('AI Busy', 'Could not generate game. Using templates instead.');
      setRounds(generateGame());
    } finally {
      setIsGenerating(false);
    }
  }, [isPro, router, selectedThemeId, selectedVibeId]);

  // Effect to handle AI Generation / Manual Mode based on subscription
  useEffect(() => {
    // If NOT Pro, we clear the auto-generated text to force manual creation (Creation Friction)
    // But we keep the structure.
    if (!isPro) {
      setRounds(prev => prev.map(r => ({
        ...r,
        statements: r.statements.map(s => ({ ...s, text: '' }))
      })));
      setRevealStyle('standard');
    } else {
      // Pro users get auto-generated content
      // We trigger generation only when theme changes or specifically requested
      regenerateAll();
    }
  }, [isPro, selectedThemeId, regenerateAll]);

  const toggleCap = (roundId: string, statementId: string) => {
    setRounds(prev => prev.map(round => {
      if (round.id !== roundId) return round;
      return {
        ...round,
        statements: round.statements.map(s => ({
          ...s,
          isLie: s.id === statementId
        }))
      };
    }));
  };

  const updateText = (roundId: string, statementId: string, text: string) => {
    setRounds(prev => prev.map(round => {
      if (round.id !== roundId) return round;
      return {
        ...round,
        statements: round.statements.map(s => 
          s.id === statementId ? { ...s, text } : s
        )
      };
    }));
  };

  const regenerateRound = (roundId: string) => {
    const newRound = generateRound(roundId);
    setRounds(prev => prev.map(r => r.id === roundId ? newRound : r));
  };

  const handleSendGame = async () => {
    const { allowed, reason } = canCreateGame();
    
    if (!allowed) {
      Alert.alert(
        'Upgrade to Pro',
        reason,
        [
          { text: 'Maybe Later', style: 'cancel' },
          { 
            text: 'Upgrade Now', 
            onPress: () => router.push('/paywall'),
            style: 'default'
          }
        ]
      );
      return;
    }

    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    const selectedTheme = THEMES.find(t => t.id === selectedThemeId);
    const game = createGame(rounds, selectedTheme?.label, undefined, revealStyle);
    
    console.log('Game created:', game.id);
    
    showShareSheet({
      gameId: game.id,
      authorName: currentUserName,
      theme: selectedTheme?.label,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Create Game</Text>
          <Text style={[styles.headerSubtitle, { color: theme.tabIconDefault }]}>
            {isPro ? 'AI Generator Active ✨' : 'Manual Mode • Upgrade for AI'}
          </Text>
        </View>
        <Pressable 
          onPress={() => regenerateAll()}
          disabled={isGenerating}
          style={({ pressed }) => [
            styles.regenAllButton,
            { backgroundColor: isPro ? theme.primary : theme.secondary, opacity: pressed || isGenerating ? 0.7 : 1 }
          ]}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color={isPro ? theme.background : theme.text} />
          ) : (
            isPro ? <Sparkles size={16} color={isPro ? theme.background : theme.text} /> : <Lock size={16} color={theme.text} />
          )}
          <Text style={[styles.regenAllText, { color: isPro ? theme.background : theme.text }]}>
            {isGenerating ? 'Generating...' : (isPro ? 'AI Shuffle' : 'Unlock AI')}
          </Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Vibe Selector */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Vibe</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {VIBES.map((vibe) => {
                const isSelected = selectedVibeId === vibe.id;
                return (
                  <Pressable
                    key={vibe.id}
                    onPress={() => setSelectedVibeId(vibe.id)}
                    style={[
                      styles.vibeChip,
                      {
                        backgroundColor: isSelected ? theme.primary : theme.secondary,
                        borderColor: isSelected ? theme.primary : 'transparent',
                      }
                    ]}
                  >
                    <Text style={{ fontSize: 16 }}>{vibe.emoji}</Text>
                    <Text style={[
                      styles.vibeLabel,
                      { color: isSelected ? theme.background : theme.text, fontWeight: isSelected ? '700' : '500' }
                    ]}>
                      {vibe.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Theme Selector */}
          <View style={styles.themesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themesList}>
              {THEMES.map((item, index) => {
                const Icon = item.icon;
                const isSelected = selectedThemeId === item.id;
                return (
                  <Animated.View key={item.id} entering={Platform.OS === 'web' ? undefined : FadeInRight.delay(index * 50)}>
                    <Pressable
                      onPress={() => setSelectedThemeId(item.id)}
                      style={[
                        styles.themeChip,
                        { 
                          backgroundColor: isSelected ? item.color : theme.secondary,
                          borderColor: isSelected ? item.color : theme.border,
                        }
                      ]}
                    >
                      <Icon size={16} color={isSelected ? '#000' : theme.text} />
                      <Text style={[
                        styles.themeLabel, 
                        { color: isSelected ? '#000' : theme.text, fontWeight: isSelected ? '700' : '500' }
                      ]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </ScrollView>
          </View>

          {/* Reveal Style Selector */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Reveal Style</Text>
            <View style={styles.revealOptions}>
              <Pressable
                onPress={() => setRevealStyle('standard')}
                style={[
                  styles.revealOption,
                  { 
                    backgroundColor: revealStyle === 'standard' ? theme.card : theme.secondary,
                    borderColor: revealStyle === 'standard' ? theme.primary : 'transparent',
                  }
                ]}
              >
                <Text style={{ fontSize: 24 }}>🙂</Text>
                <Text style={[styles.revealOptionText, { color: theme.text }]}>Standard</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  if (!isPro) {
                    router.push('/paywall');
                  } else {
                    setRevealStyle('mega');
                  }
                }}
                style={[
                  styles.revealOption,
                  { 
                    backgroundColor: revealStyle === 'mega' ? theme.card : theme.secondary,
                    borderColor: revealStyle === 'mega' ? theme.primary : 'transparent',
                  }
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                   <Text style={{ fontSize: 24 }}>💥</Text>
                   {!isPro && <Lock size={12} color={theme.text} />}
                </View>
                <Text style={[styles.revealOptionText, { color: theme.text }]}>Mega</Text>
              </Pressable>
            </View>
          </View>

          {/* Rounds List */}
          <View style={styles.roundsContainer}>
            {rounds.map((round, roundIndex) => (
              <Animated.View 
                key={round.id} 
                layout={Platform.OS === 'web' ? undefined : Layout.springify()}
                entering={Platform.OS === 'web' ? undefined : FadeInUp.delay(roundIndex * 100)}
                style={[styles.roundCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={styles.roundHeader}>
                  <Text style={[styles.roundLabel, { color: theme.tabIconDefault }]}>ROUND {roundIndex + 1}</Text>
                  <Pressable onPress={() => regenerateRound(round.id)} hitSlop={10}>
                    <RefreshCcw size={14} color={theme.tabIconDefault} />
                  </Pressable>
                </View>

                {round.statements.map((stmt) => (
                  <View key={stmt.id} style={[
                    styles.statementRow, 
                    { 
                      borderColor: stmt.isLie ? theme.danger : 'transparent',
                      backgroundColor: stmt.isLie ? 'rgba(255, 59, 48, 0.05)' : theme.surface,
                    }
                  ]}>
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      value={stmt.text}
                      onChangeText={(text) => updateText(round.id, stmt.id, text)}
                      placeholder="Type a statement..."
                      placeholderTextColor={theme.tabIconDefault}
                    />
                    <Pressable 
                      onPress={() => toggleCap(round.id, stmt.id)}
                      style={[
                        styles.capToggle, 
                        { 
                          backgroundColor: stmt.isLie ? theme.danger : 'transparent',
                          borderColor: stmt.isLie ? theme.danger : theme.border,
                        }
                      ]}
                    >
                      <Text style={[
                        styles.capToggleText, 
                        { color: stmt.isLie ? '#FFF' : theme.tabIconDefault }
                      ]}>
                        {stmt.isLie ? 'CAP' : 'TRUTH'}
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </Animated.View>
            ))}
          </View>
          
          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={[styles.footer, { 
        backgroundColor: theme.background, 
        borderTopColor: theme.border,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20 
      }]}>
        {!isPro && getRemainingGames() === 0 && (
          <Pressable
            onPress={() => router.push('/paywall')}
            style={[styles.proNotice, { backgroundColor: '#FF4F00' }]}
          >
            <Crown size={16} color="#000" />
            <Text style={styles.proNoticeText}>Daily limit reached. Upgrade to Pro for unlimited games!</Text>
          </Pressable>
        )}
        <Pressable 
          onPress={handleSendGame}
          style={({ pressed }) => [
            styles.sendButton,
            { backgroundColor: theme.primary, transform: [{ scale: pressed ? 0.98 : 1 }] }
          ]}
        >
          <Text style={[styles.sendButtonText, { color: theme.background }]}>Send Game (5 Rounds)</Text>
          <Send size={20} color={theme.background} />
        </Pressable>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  regenAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    gap: 6,
  },
  regenAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  vibeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    gap: 8,
  },
  vibeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  themesContainer: {
    marginBottom: 20,
  },
  themesList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  themeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    gap: 8,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  revealOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  revealOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 8,
  },
  revealOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  roundsContainer: {
    paddingHorizontal: 20,
    gap: 24,
  },
  roundCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  roundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roundLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    padding: 0,
  },
  capToggle: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
  },
  capToggleText: {
    fontSize: 10,
    fontWeight: '900',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 100,
    gap: 8,
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  proNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  proNoticeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
});
