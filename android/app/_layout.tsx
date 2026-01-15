import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { GameProvider } from '@/providers/GameProvider';
import { trpc, trpcClient } from '@/utils/trpc';
import TrialCountdownModal from '@/components/TrialCountdownModal';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  
  return (
    <>
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF' }
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="game/[id]" options={{ presentation: 'card', headerShown: false, gestureEnabled: true }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <TrialCountdownModal />
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GameProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="auto" />
            <RootLayoutNav />
          </GestureHandlerRootView>
        </GameProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
