import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { Audio } from 'expo-av';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSequence,
  withTiming, 
  withSpring,
  withDelay,
  runOnJS
} from 'react-native-reanimated';
import { Confetti } from './Confetti';
import * as Haptics from 'expo-haptics';

export const MegaReveal = ({ onComplete }: { onComplete?: () => void }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);
  const shake = useSharedValue(0);
  
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let sound: Audio.Sound | null = null;

    const playSound = async () => {
      try {
        const { sound: s } = await Audio.Sound.createAsync(
           // Short explosion sound
           { uri: 'https://assets.mixkit.co/active_storage/sfx/2007/2007-preview.mp3' }
        );
        sound = s;
        await sound.playAsync();
      } catch (err) {
        console.warn('Failed to play sound', err);
      }
    };

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Extra impact sequence for Mega feel
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 100);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 300);
    }

    playSound();

    // Shake effect
    shake.value = withSequence(
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );

    // Scale up text
    scale.value = withSpring(1, { damping: 12 });

    // Fade out
    opacity.value = withDelay(2500, withTiming(0, { duration: 500 }, (finished) => {
      if (finished && onCompleteRef.current) {
        runOnJS(onCompleteRef.current)();
      }
    }));

    return () => {
      sound?.unloadAsync();
    };
  }, [opacity, scale, shake]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: shake.value }
    ],
    opacity: opacity.value
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      <Confetti />
      <Animated.View style={[styles.content, animatedStyle]}>
        <Text style={styles.text}>💥 BOOM! 💥</Text>
        <Text style={styles.subtext}>MEGA REVEAL!</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FF4F00',
    textShadowColor: 'black',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 8,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowColor: 'black',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  }
});
