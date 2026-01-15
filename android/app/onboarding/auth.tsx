import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, Phone, Crown } from 'lucide-react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useGameContext } from '@/providers/GameProvider';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { startTrial } = useGameContext();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);

  const handleLogin = () => {
    if (phoneNumber.length < 10) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      startTrial();
      setShowTrialModal(true);
    }, 1500);
  };

  const handleContinue = () => {
    setShowTrialModal(false);
    router.replace('/(tabs)/play');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.content}>
        <Animated.View entering={Platform.OS === 'web' ? undefined : FadeInDown.delay(200)}>
          <Text style={styles.title}>What&apos;s your number?</Text>
          <Text style={styles.subtitle}>We&apos;ll text you a code to verify you&apos;re real.</Text>
        </Animated.View>

        <Animated.View entering={Platform.OS === 'web' ? undefined : FadeInDown.delay(400)} style={styles.inputContainer}>
          <Phone color="#666" size={24} />
          <TextInput
            style={styles.input}
            placeholder="(555) 123-4567"
            placeholderTextColor="#444"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            autoFocus
          />
        </Animated.View>
      </View>

      <Animated.View 
        style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}
        entering={Platform.OS === 'web' ? undefined : FadeInDown.delay(600)}
      >
        <Pressable 
          style={[
            styles.button, 
            { opacity: phoneNumber.length >= 10 ? 1 : 0.5 }
          ]}
          onPress={handleLogin}
          disabled={phoneNumber.length < 10 || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Text style={styles.buttonText}>Send Code</Text>
              <ArrowRight size={20} color="#000" />
            </>
          )}
        </Pressable>
      </Animated.View>

      <Modal
        visible={showTrialModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            entering={Platform.OS === 'web' ? undefined : ZoomIn}
            style={styles.modalContent}
          >
            <View style={styles.modalIcon}>
              <Crown size={40} color="#000" fill="#000" />
            </View>
            <Text style={styles.modalTitle}>You&apos;re on Pro!</Text>
            <Text style={styles.modalText}>
              Enjoy 3 days of unlimited chains, AI-powered statement generation, advanced analytics, and exclusive challenges. Will downgrade to Free automatically if not upgraded.
            </Text>
            <Pressable style={styles.modalButton} onPress={handleContinue}>
              <Text style={styles.modalButtonText}>Let&apos;s Go</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#333',
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 24,
    color: '#FF4F00',
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
  },
  button: {
    backgroundColor: '#FF4F00',
    paddingVertical: 20,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF4F00',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#CCC',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  modalButton: {
    backgroundColor: '#FF4F00',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 100,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});
