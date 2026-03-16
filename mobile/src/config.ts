import { Platform } from 'react-native';

/**
 * API base URL for the GrocerEase backend.
 * - EXPO_PUBLIC_API_URL env var overrides for production/staging
 * - Android emulator uses 10.0.2.2 to reach host machine's localhost
 * - iOS simulator can use localhost directly
 */
export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === 'android'
    ? 'http://10.0.2.2:3001'
    : 'http://localhost:3001');
