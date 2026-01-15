import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withDelay, 
  withTiming, 
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLORS = ['#FF4F00', '#FF3B30', '#007AFF', '#FF9500', '#AF52DE', '#FFFFFF'];
const CONFETTI_COUNT = 40;

interface ConfettiPieceProps {
  startX: number;
  startY: number;
  delay: number;
  color: string;
}

const ConfettiPiece = ({ startX, startY, delay, color }: ConfettiPieceProps) => {
  const translateX = useSharedValue(startX);
  const translateY = useSharedValue(startY);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);

  useEffect(() => {
    // Initial explosion
    const angle = Math.random() * Math.PI * 2;
    const velocity = 150 + Math.random() * 200;
    const endX = startX + Math.cos(angle) * velocity;
    const endY = startY + Math.sin(angle) * velocity;

    scale.value = withDelay(delay, withSpring(1));
    
    translateX.value = withDelay(delay, withTiming(endX, {
      duration: 1000,
      easing: Easing.out(Easing.quad),
    }));

    // Gravity effect
    translateY.value = withDelay(delay, withSequence(
      withTiming(endY, { duration: 600, easing: Easing.out(Easing.quad) }),
      withTiming(SCREEN_HEIGHT + 100, { duration: 2000, easing: Easing.in(Easing.quad) })
    ));

    rotate.value = withDelay(delay, withTiming(Math.random() * 720 - 360, {
      duration: 2000,
    }));

    opacity.value = withDelay(delay + 1500, withTiming(0, { duration: 500 }));
  }, [delay, opacity, rotate, scale, startX, startY, translateX, translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.piece, style, { backgroundColor: color }]} />
  );
};

export const Confetti = () => {
  const [pieces, setPieces] = useState<any[]>([]);

  useEffect(() => {
    const newPieces = Array.from({ length: CONFETTI_COUNT }).map((_, i) => ({
      id: i,
      startX: SCREEN_WIDTH / 2,
      startY: SCREEN_HEIGHT / 2,
      delay: Math.random() * 200,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    setPieces(newPieces);
  }, []);

  if (Platform.OS === 'web') return null; // Simplified for web

  return (
    <View style={styles.container} pointerEvents="none">
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} {...p} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    elevation: 999,
  },
  piece: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
