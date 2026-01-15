import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Star, Zap, Crown, TrendingUp, Sparkles } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useGameContext } from '@/providers/GameProvider';
import * as Haptics from 'expo-haptics';

const FEATURES = [
  { icon: Zap, title: 'Unlimited Challenges', desc: 'Create as many Caps as you want.' },
  { icon: Crown, title: 'AI Personal Caps', desc: 'Generate Caps based on your vibes.' },
  { icon: Sparkles, title: 'Mega Reveals', desc: 'Explosive reveal animations & sounds.' },
  { icon: Star, title: 'Advanced Chain Stats', desc: 'See who is best at spotting your lies.' },
  { icon: TrendingUp, title: 'Premium Themes', desc: 'Access exclusive theme packs.' },
];

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { upgradeToPro, trialStatus } = useGameContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const isTrialActive = trialStatus === 'active';

  const handlePurchase = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);

    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setTimeout(async () => {
      upgradeToPro();
      
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert(
        isTrialActive ? 'Pro Kept! 🎉' : '🎉 Welcome to Pro!',
        isTrialActive ? 'Your Pro access continues uninterrupted.' : 'You now have unlimited access to all features.',
        [{
          text: 'Let\'s Go!',
          onPress: () => router.back()
        }]
      );
      
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <Stack.Screen options={{ presentation: 'modal', headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable 
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <X size={24} color="#FFF" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={Platform.OS === 'web' ? undefined : FadeInUp.springify()} style={styles.hero}>
          <View style={styles.iconContainer}>
            <Crown size={48} color="#FF4F00" fill="#FF4F00" />
          </View>
          <Text style={styles.title}>ONE CAP <Text style={{ color: '#FF4F00' }}>PRO</Text></Text>
          <Text style={styles.subtitle}>
            {isTrialActive ? 'Keep your Pro benefits forever.' : 'Unlock the full potential of your lies.'}
          </Text>
        </Animated.View>

        <View style={styles.features}>
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Animated.View 
                key={index} 
                entering={Platform.OS === 'web' ? undefined : FadeInDown.delay(index * 100 + 200)}
                style={styles.featureItem}
              >
                <View style={styles.featureIcon}>
                  <Icon size={24} color="#000" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.desc}</Text>
                </View>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      <Animated.View 
        style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}
        entering={Platform.OS === 'web' ? undefined : FadeInDown.delay(600)}
      >
        <Pressable 
          onPress={handlePurchase}
          disabled={isProcessing}
          style={[styles.button, { opacity: isProcessing ? 0.7 : 1 }]}
        >
          <Text style={styles.buttonText}>
            {isProcessing ? 'Processing...' : (isTrialActive ? 'Keep PRO for $3.99/wk' : 'Unlock PRO for $3.99/wk')}
          </Text>
        </Pressable>
        <Text style={styles.disclaimer}>Cancel anytime. Terms apply.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    marginBottom: 24,
    shadowColor: '#FF4F00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#AAA',
    textAlign: 'center',
  },
  features: {
    gap: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF4F00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: '#888',
  },
  footer: {
    padding: 24,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  button: {
    backgroundColor: '#FF4F00',
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  disclaimer: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
});
