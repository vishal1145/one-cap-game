import { Redirect } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Mock auth check
    const checkAuth = async () => {
      // Simulate checking storage
      setTimeout(() => {
        // For now, always redirect to onboarding for demo purposes
        // Change to true to skip onboarding
        setIsAuthenticated(false);
        setIsLoading(false);
      }, 500);
    };
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#FF4F00" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/play" />;
  }

  return <Redirect href="/onboarding/welcome" />;
}
