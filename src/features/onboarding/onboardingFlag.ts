import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'wanderlust.onboarding.seen.v1';

/** Erststart-Flag (A-AP8-3: lokal; nach Neuinstallation erscheint das Intro erneut). */
export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === 'true';
  } catch {
    return true; // im Zweifel App nicht blockieren
  }
}

export async function markOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, 'true');
  } catch {
    // bewusst ignoriert — schlimmstenfalls erscheint das Intro erneut
  }
}
