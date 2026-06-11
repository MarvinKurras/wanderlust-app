import {
  Cormorant_400Regular,
  Cormorant_400Regular_Italic,
  Cormorant_500Medium,
  Cormorant_600SemiBold,
} from '@expo-google-fonts/cormorant';
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
} from '@expo-google-fonts/hanken-grotesk';
import {
  SplineSansMono_400Regular,
  SplineSansMono_500Medium,
} from '@expo-google-fonts/spline-sans-mono';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

// Offline-Lesbarkeit (Projektplan §3 / AP7): Query-Cache 7 Tage in AsyncStorage persistieren
const CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: CACHE_MAX_AGE_MS,
      staleTime: 1000 * 60 * 5,
    },
  },
});
const persister = createAsyncStoragePersister({ storage: AsyncStorage });

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Cormorant_400Regular,
    Cormorant_400Regular_Italic,
    Cormorant_500Medium,
    Cormorant_600SemiBold,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    SplineSansMono_400Regular,
    SplineSansMono_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: CACHE_MAX_AGE_MS }}
    >
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.paper },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="ort/[id]" />
      </Stack>
    </PersistQueryClientProvider>
  );
}
