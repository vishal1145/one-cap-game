import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

export default function DemoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  
  const correctLieId = '2'; // "I hate pizza" is the lie

  const handleGuess = (id: string) => {
    if (selected) return;
    setSelected(id);
  };

  const isRevealed = !!selected;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Interactive Demo</Text>
      </View>

      <View style={styles.content}>
        {isRevealed && selected !== correctLieId ? (
          <View style={[styles.instructionContainer, { marginBottom: 40 }]}>
             <Text style={styles.instructionText}>YOU GOT CAPPED!</Text>
             <Image 
               source={{ uri: "https://r2-pub.rork.com/generated-images/ca803866-6b41-4386-8104-fa84310d87eb.png" }}
               style={{ width: 40, height: 40 }}
               contentFit="contain"
             />
          </View>
        ) : (
          <Text style={styles.instruction}>
            {isRevealed 
              ? "NAILED IT! 🎯"
              : "Guess the Lie"}
          </Text>
        )}

        <View style={styles.cards}>
          <DemoCard 
            id="1" 
            text="I’ve been to 5 countries" 
            onPress={handleGuess} 
            selected={selected} 
            isLie={false}
          />
          <DemoCard 
            id="2" 
            text="I hate pizza" 
            onPress={handleGuess} 
            selected={selected} 
            isLie={true}
          />
          <DemoCard 
            id="3" 
            text="I once skipped school" 
            onPress={handleGuess} 
            selected={selected} 
            isLie={false}
          />
        </View>
      </View>

      <View style={styles.footer}>
        {isRevealed && (
          <Animated.View entering={Platform.OS === 'web' ? undefined : FadeInDown.springify()}>
            <Pressable 
              style={styles.button}
              onPress={() => router.push('/onboarding/auth')}
            >
              <Text style={styles.buttonText}>Continue</Text>
              <ArrowRight size={20} color="#000" />
            </Pressable>
          </Animated.View>
        )}
        {!isRevealed && (
           <Text style={styles.hintText}>Tap the statement you think is a lie.</Text>
        )}
      </View>
    </View>
  );
}

function DemoCard({ id, text, onPress, selected, isLie }: any) {
  const isSelected = selected === id;
  const showResult = !!selected;
  
  let borderColor = '#333';
  let bgColor = '#111';

  if (showResult) {
    if (isLie) {
      borderColor = '#FF4F00';
      bgColor = 'rgba(255, 79, 0, 0.1)';
    } else if (isSelected && !isLie) {
      borderColor = '#FF3B30';
      bgColor = 'rgba(255, 59, 48, 0.1)';
    }
  }

  return (
    <Pressable 
      onPress={() => onPress(id)}
      disabled={showResult}
      style={[styles.card, { borderColor, backgroundColor: bgColor }]}
    >
      <Text style={styles.cardText}>{text}</Text>
      {showResult && isLie && (
        <Animated.View entering={Platform.OS === 'web' ? undefined : ZoomIn}>
          <CheckCircle color="#FF4F00" size={24} />
        </Animated.View>
      )}
      {showResult && isSelected && !isLie && (
        <Animated.View entering={Platform.OS === 'web' ? undefined : ZoomIn}>
          <XCircle color="#FF3B30" size={24} />
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerText: {
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  instructionText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
  },
  instruction: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 40,
  },
  cards: {
    gap: 16,
  },
  card: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    minHeight: 100,
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
  hintText: {
    color: '#666',
    textAlign: 'center',
  },
});
