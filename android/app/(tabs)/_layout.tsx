import { Tabs } from "expo-router";
import { Play, PlusSquare, User, Zap } from "lucide-react-native";
import React from "react";
import { Platform, View, useColorScheme } from "react-native";
import { Colors } from "@/constants/colors";
import TrialBanner from "@/components/TrialBanner";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ paddingTop: insets.top, backgroundColor: theme.background }}>
        <TrialBanner />
      </View>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.tint,
          tabBarInactiveTintColor: theme.tabIconDefault,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.background,
            borderTopColor: theme.border,
            height: Platform.OS === 'ios' ? 88 : 60,
            paddingBottom: Platform.OS === 'ios' ? 28 : 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontWeight: 'bold',
            fontSize: 10,
            textTransform: 'uppercase',
          }
        }}
      >
        <Tabs.Screen
          name="play"
          options={{
            title: "Play",
            tabBarIcon: ({ color }) => <Play color={color} size={24} fill={color} />,
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: "Create",
            tabBarIcon: ({ color }) => <PlusSquare color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="chains"
          options={{
            title: "Chains",
            tabBarIcon: ({ color }) => <Zap color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => <User color={color} size={24} />,
          }}
        />
      </Tabs>
    </View>
  );
}
