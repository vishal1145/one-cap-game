import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameContext } from '@/providers/GameProvider';
import { differenceInSeconds } from 'date-fns';
import { Clock, Crown, ArrowRight } from 'lucide-react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function TrialCountdownModal() {
  const router = useRouter();
  const { trialEndTimestamp, showUrgentTrialModal, closeUrgentTrialModal } = useGameContext();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!showUrgentTrialModal || !trialEndTimestamp) return;

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    const updateTime = () => {
      const now = Date.now();
      if (now >= trialEndTimestamp) {
        setTimeLeft('00:00:00');
        return;
      }

      const diffSecs = differenceInSeconds(trialEndTimestamp, now);
      const h = Math.floor(diffSecs / 3600);
      const m = Math.floor((diffSecs % 3600) / 60);
      const s = diffSecs % 60;

      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [showUrgentTrialModal, trialEndTimestamp]);

  const handleKeepPro = () => {
    closeUrgentTrialModal();
    router.push('/paywall');
  };

  const handleMaybeLater = () => {
    closeUrgentTrialModal();
  };

  if (!showUrgentTrialModal) return null;

  return (
    <Modal
      visible={showUrgentTrialModal}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View 
          entering={Platform.OS === 'web' ? undefined : ZoomIn}
          style={styles.content}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Clock size={32} color="#000" />
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>EXPIRING SOON</Text>
            </View>
          </View>

          <Text style={styles.title}>Heads up!</Text>
          <Text style={styles.subtitle}>
            Your Pro trial ends in <Text style={styles.highlight}>{timeLeft}</Text>.
            Don&apos;t lose your streaks and unlimited chains.
          </Text>

          <View style={styles.features}>
            <View style={styles.featureRow}>
              <Crown size={16} color="#FF4F00" />
              <Text style={styles.featureText}>Unlimited Chains</Text>
            </View>
            <View style={styles.featureRow}>
              <Crown size={16} color="#FF4F00" />
              <Text style={styles.featureText}>AI Statement Generator</Text>
            </View>
            <View style={styles.featureRow}>
              <Crown size={16} color="#FF4F00" />
              <Text style={styles.featureText}>Advanced Analytics</Text>
            </View>
          </View>

          <Pressable style={styles.primaryButton} onPress={handleKeepPro}>
            <Text style={styles.primaryButtonText}>Keep Pro</Text>
            <ArrowRight size={20} color="#000" />
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={handleMaybeLater}>
            <Text style={styles.secondaryButtonText}>Maybe Later</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#1A1A1A',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF4F00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#CCC',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  highlight: {
    color: '#FF4F00',
    fontVariant: ['tabular-nums'],
    fontWeight: 'bold',
  },
  features: {
    width: '100%',
    backgroundColor: '#222',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#FF4F00',
    paddingVertical: 18,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});
