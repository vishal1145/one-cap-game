import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameContext } from '@/providers/GameProvider';
import { differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { Crown } from 'lucide-react-native';

export default function TrialBanner() {
  const router = useRouter();
  const { trialStatus, trialEndTimestamp } = useGameContext();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (trialStatus !== 'active' || !trialEndTimestamp) return;

    const updateTime = () => {
      const now = Date.now();
      if (now >= trialEndTimestamp) {
        setTimeLeft('Expired');
        return;
      }

      const hours = differenceInHours(trialEndTimestamp, now);
      const days = differenceInDays(trialEndTimestamp, now);

      if (days > 0) {
        setTimeLeft(`${days} day${days > 1 ? 's' : ''} remaining`);
      } else {
        const minutes = differenceInMinutes(trialEndTimestamp, now) % 60;
        setTimeLeft(`${hours}h ${minutes}m remaining`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [trialStatus, trialEndTimestamp]);

  if (trialStatus !== 'active') return null;

  return (
    <Pressable onPress={() => router.push('/paywall')} style={styles.container}>
      <View style={styles.content}>
        <Crown size={16} color="#000" fill="#000" />
        <Text style={styles.text}>
          Pro Trial: <Text style={styles.bold}>{timeLeft}</Text>
        </Text>
      </View>
      <View style={styles.button}>
        <Text style={styles.buttonText}>Keep Pro</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF4F00',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    color: '#000',
    fontSize: 13,
    fontWeight: '500',
  },
  bold: {
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  buttonText: {
    color: '#FF4F00',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
