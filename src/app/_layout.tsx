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
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

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
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.paper },
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
