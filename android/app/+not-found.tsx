import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, View, Pressable, useColorScheme } from 'react-native';
import { Colors } from '@/constants/colors';

export default function NotFoundScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>This screen doesn&apos;t exist.</Text>

        <Pressable onPress={() => router.replace('/(tabs)/play')} style={styles.link}>
          <Text style={[styles.linkText, { color: theme.accent }]}>Go to home screen!</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
