import { useState, useEffect, useRef, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpc } from '@/utils/trpc';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface Statement {
  id: string;
  text: string;
  isLie: boolean;
}

export interface Round {
  id: string;
  statements: Statement[];
}

export interface Game {
  id: string;
  rounds: Round[];
  authorId: string;
  authorName: string;
  createdAt: number;
  theme?: string;
  revealStyle?: 'standard' | 'mega';
  chainId?: string;
  parentChallengeId?: string;
  authorIsPro?: boolean;
}

export interface GameResult {
  gameId: string;
  score: number;
  totalRounds: number;
  playedAt: number;
  authorName: string;
}

export interface Chain {
  id: string;
  starterId: string;
  starterName: string;
  starterIsPro?: boolean;
  games: string[];
  participants: string[];
  createdAt: number;
  lastActive: number;
  theme: string;
}

interface GameState {
  receivedGames: Game[];
  sentGames: Game[];
  gameResults: GameResult[];
  chains: Chain[];
  currentUserId: string;
  currentUserName: string;
  isPro: boolean;
  gamesCreatedToday: number;
  lastGameCreatedDate: string;
  trialStatus: 'none' | 'active' | 'converted' | 'expired';
  trialStartTimestamp: number | null;
  trialEndTimestamp: number | null;
  showUrgentTrialModal: boolean;
  hasShown24hWarning: boolean;
  hasShown3hWarning: boolean;
}

const STORAGE_KEY = '@onecap_games';

export const [GameProvider, useGameContext] = createContextHook(() => {
  const [state, setState] = useState<GameState>({
    receivedGames: [],
    sentGames: [],
    gameResults: [],
    chains: [],
    currentUserId: 'user-001',
    currentUserName: 'You',
    isPro: false,
    gamesCreatedToday: 0,
    lastGameCreatedDate: new Date().toDateString(),
    trialStatus: 'none',
    trialStartTimestamp: null,
    trialEndTimestamp: null,
    showUrgentTrialModal: false,
    hasShown24hWarning: false,
    hasShown3hWarning: false,
  });

  const stateRef = useRef(state);
  
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const createGameMutation = trpc.games.create.useMutation();

  const saveState = async (newState: GameState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  };

  const loadState = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if trial expired while app was closed
        const newState = { ...stateRef.current, ...parsed };
        
        // Reset modal state on reload to avoid getting stuck
        newState.showUrgentTrialModal = false;

        if (newState.trialStatus === 'active' && newState.trialEndTimestamp) {
           const now = Date.now();
           if (now >= newState.trialEndTimestamp) {
             newState.trialStatus = 'expired';
             newState.isPro = false;
           }
        }
        
        setState(newState);
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    }
  }, []);

  const scheduleNotification = async (title: string, body: string, seconds: number) => {
    if (Platform.OS === 'web') return;
    
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
        },
        trigger: {
          seconds: Math.max(1, seconds),
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        },
      });
    } catch (e) {
      console.log('Failed to schedule notification', e);
    }
  };

  const checkTrialStatus = useCallback(() => {
    const currentState = stateRef.current;
    if (currentState.trialStatus === 'active' && currentState.trialEndTimestamp) {
      const now = Date.now();
      const timeLeft = currentState.trialEndTimestamp - now;
      const hoursLeft = timeLeft / (1000 * 60 * 60);

      let newState = { ...currentState };
      let changed = false;

      // Expired
      if (timeLeft <= 0) {
        newState.trialStatus = 'expired';
        newState.isPro = false;
        newState.showUrgentTrialModal = false;
        changed = true;
      }
      // 3 Hours remaining warning (trigger once)
      else if (hoursLeft <= 3 && !currentState.hasShown3hWarning) {
        newState.hasShown3hWarning = true;
        newState.showUrgentTrialModal = true;
        changed = true;
        // Notification is already scheduled in startTrial
      }
      // 24 Hours remaining warning (trigger once)
      else if (hoursLeft <= 24 && hoursLeft > 3 && !currentState.hasShown24hWarning) {
        newState.hasShown24hWarning = true;
        changed = true;
        // Notification is already scheduled in startTrial
      }

      if (changed) {
        setState(newState);
        saveState(newState);
      }
    }
  }, []);

  useEffect(() => {
    loadState();
    
    // Request permissions
    if (Platform.OS !== 'web') {
      Notifications.requestPermissionsAsync();
    }
  }, [loadState]);

  useEffect(() => {
    // Check trial status every minute
    const interval = setInterval(() => {
      checkTrialStatus();
    }, 60000);
    
    // Also check immediately
    checkTrialStatus();
    
    return () => clearInterval(interval);
  }, [checkTrialStatus]);

  const createGame = (rounds: Round[], theme?: string, parentChallengeId?: string, revealStyle: 'standard' | 'mega' = 'standard'): Game => {
    const today = new Date().toDateString();
    const isNewDay = state.lastGameCreatedDate !== today;
    const gamesCount = isNewDay ? 1 : state.gamesCreatedToday + 1;

    const game: Game = {
      id: `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      rounds,
      authorId: state.currentUserId,
      authorName: state.currentUserName,
      createdAt: Date.now(),
      theme,
      revealStyle,
      parentChallengeId,
      authorIsPro: state.isPro,
    };

    const newState = {
      ...state,
      sentGames: [game, ...state.sentGames],
      gamesCreatedToday: gamesCount,
      lastGameCreatedDate: today,
    };
    setState(newState);
    saveState(newState);

    // Sync with backend
    createGameMutation.mutate(game);

    return game;
  };

  const receiveGame = (game: Game) => {
    const newState = {
      ...state,
      receivedGames: [game, ...state.receivedGames],
    };
    setState(newState);
    saveState(newState);
  };

  const recordGameResult = (result: GameResult) => {
    const newState = {
      ...state,
      gameResults: [result, ...state.gameResults],
    };
    setState(newState);
    saveState(newState);
  };

  const getGame = (gameId: string): Game | undefined => {
    return [...state.receivedGames, ...state.sentGames].find(g => g.id === gameId);
  };

  const createChain = (gameId: string, theme: string): Chain => {
    const chain: Chain = {
      id: `chain-${Date.now()}`,
      starterId: state.currentUserId,
      starterName: state.currentUserName,
      starterIsPro: state.isPro,
      games: [gameId],
      participants: [state.currentUserId],
      createdAt: Date.now(),
      lastActive: Date.now(),
      theme,
    };

    const newState = {
      ...state,
      chains: [chain, ...state.chains],
      hasShown24hWarning: false, // Reset warning flags on new purchase/trial? No, only on new trial start.
    };
    setState(newState);
    saveState(newState);

    return chain;
  };

  const addGameToChain = (chainId: string, gameId: string, participantId: string) => {
    const chainIndex = state.chains.findIndex(c => c.id === chainId);
    if (chainIndex === -1) return;

    const updatedChain = {
      ...state.chains[chainIndex],
      games: [...state.chains[chainIndex].games, gameId],
      participants: state.chains[chainIndex].participants.includes(participantId)
        ? state.chains[chainIndex].participants
        : [...state.chains[chainIndex].participants, participantId],
      lastActive: Date.now(),
    };

    const newChains = [...state.chains];
    newChains[chainIndex] = updatedChain;

    const newState = {
      ...state,
      chains: newChains,
    };
    setState(newState);
    saveState(newState);
  };

  const boostChain = (chainId: string) => {
    const chainIndex = state.chains.findIndex(c => c.id === chainId);
    if (chainIndex === -1) return;

    const updatedChain = {
      ...state.chains[chainIndex],
      lastActive: Date.now(),
    };

    const newChains = [...state.chains];
    newChains[chainIndex] = updatedChain;

    const newState = {
      ...state,
      chains: newChains,
    };
    setState(newState);
    saveState(newState);
  };

  const updateUserProfile = (name: string) => {
    const newState = {
      ...state,
      currentUserName: name,
    };
    setState(newState);
    saveState(newState);
  };

  const getStreakDays = (): number => {
    if (state.gameResults.length === 0) return 0;

    const sortedResults = [...state.gameResults].sort((a, b) => b.playedAt - a.playedAt);
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const result of sortedResults) {
      const resultDate = new Date(result.playedAt);
      resultDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((currentDate.getTime() - resultDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
      } else if (diffDays > streak) {
        break;
      }
    }

    return streak;
  };

  const getAccuracy = (): number => {
    if (state.gameResults.length === 0) return 0;
    const totalScore = state.gameResults.reduce((sum, r) => sum + r.score, 0);
    const totalPossible = state.gameResults.reduce((sum, r) => sum + r.totalRounds, 0);
    return Math.round((totalScore / totalPossible) * 100);
  };

  const canCreateGame = (): { allowed: boolean; reason?: string } => {
    if (state.isPro) return { allowed: true };

    const today = new Date().toDateString();
    const isNewDay = state.lastGameCreatedDate !== today;
    const gamesCount = isNewDay ? 0 : state.gamesCreatedToday;

    const FREE_DAILY_LIMIT = 1;
    if (gamesCount >= FREE_DAILY_LIMIT) {
      return { allowed: false, reason: `Free users can create ${FREE_DAILY_LIMIT} game per day. Upgrade to Pro for unlimited!` };
    }

    return { allowed: true };
  };

  const upgradeToPro = async () => {
    const newState: GameState = {
      ...state,
      isPro: true,
      trialStatus: 'converted', // Mark as converted if they pay
      showUrgentTrialModal: false,
    };
    setState(newState);
    saveState(newState);
    
    if (Platform.OS !== 'web') {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const startTrial = async () => {
    // Only start if not already started/expired/converted
    if (state.trialStatus !== 'none') return;

    const now = Date.now();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    
    const newState: GameState = {
      ...state,
      isPro: true,
      trialStatus: 'active',
      trialStartTimestamp: now,
      trialEndTimestamp: now + threeDaysMs,
      hasShown24hWarning: false,
      hasShown3hWarning: false,
    };
    
    setState(newState);
    saveState(newState);

    if (Platform.OS !== 'web') {
      try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        
        // 24 hours remaining (48 hours from now)
        await scheduleNotification(
          "1 Day Left of Pro 👑",
          "Your Pro trial expires in 24 hours. Don't lose your unlimited access.",
          48 * 60 * 60
        );

        // 3 hours remaining (69 hours from now)
        await scheduleNotification(
          "Trial Ending Soon! ⏳",
          "Only 3 hours left of One Cap Pro. Keep your streaks alive!",
          69 * 60 * 60
        );
      } catch (error) {
        console.error('Failed to schedule trial notifications:', error);
      }
    }
  };

  const closeUrgentTrialModal = () => {
    const newState = {
        ...state,
        showUrgentTrialModal: false
    };
    setState(newState);
    saveState(newState);
  };

  const getRemainingGames = (): number => {
    if (state.isPro) return -1;
    const today = new Date().toDateString();
    const isNewDay = state.lastGameCreatedDate !== today;
    const gamesCount = isNewDay ? 0 : state.gamesCreatedToday;
    const FREE_DAILY_LIMIT = 1;
    return Math.max(0, FREE_DAILY_LIMIT - gamesCount);
  };

  return {
    ...state,
    createGame,
    receiveGame,
    recordGameResult,
    getGame,
    createChain,
    addGameToChain,
    updateUserProfile,
    getStreakDays,
    getAccuracy,
    canCreateGame,
    upgradeToPro,
    startTrial,
    getRemainingGames,
    boostChain,
    closeUrgentTrialModal,
  };
});
