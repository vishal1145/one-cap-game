import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useSharedValue, 
  useAnimatedStyle, 
  withDelay, 
  withRepeat, 
  withSequence, 
  withTiming 
} from 'react-native-reanimated';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      )
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <Animated.View entering={Platform.OS === 'web' ? undefined : FadeInUp.delay(200).springify()}>
          <Animated.View style={animatedStyle}>
            <Image 
              source={{ uri: "https://r2-pub.rork.com/generated-images/ca803866-6b41-4386-8104-fa84310d87eb.png" }} 
              style={styles.logo}
              contentFit="contain"
            />
          </Animated.View>
        </Animated.View>
        
        <Animated.View entering={Platform.OS === 'web' ? undefined : FadeInDown.delay(400).springify()}>
          <Text style={styles.title}>ONE CAP!</Text>
          <Text style={styles.subtitle}>
            3 Statements.{'\n'}
            1 Lie.{'\n'}
            Don&apos;t choke.
          </Text>
        </Animated.View>
      </View>

      <Animated.View 
        style={styles.footer}
        entering={Platform.OS === 'web' ? undefined : FadeInDown.delay(600).springify()}
      >
        <Pressable 
          style={({ pressed }) => [
            styles.button, 
            { transform: [{ scale: pressed ? 0.98 : 1 }] }
          ]}
          onPress={() => router.push('/onboarding/demo')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <ArrowRight size={20} color="#000" />
        </Pressable>
        
        <Text style={styles.disclaimer}>
          By tapping Get Started, you agree to our Terms and Privacy Policy.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FF4F00',
    textAlign: 'center',
    letterSpacing: -2,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 40,
  },
  footer: {
    padding: 20,
    gap: 20,
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
  disclaimer: {
    color: '#666',
    textAlign: 'center',
    fontSize: 12,
  },
});
