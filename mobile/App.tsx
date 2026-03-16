import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configure } from '@grocery-app/shared';
import { API_BASE_URL } from './src/config';
import RootNavigator from './src/navigation/RootNavigator';

// Configure the shared API client to point at the backend
configure({ baseURL: API_BASE_URL });

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style="dark" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
