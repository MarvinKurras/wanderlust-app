import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { isPreview } from './preview';

// Die Web-Vorschau läuft ohne Backend; ihr Client wird nie angesprochen.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? (isPreview ? 'http://localhost' : '');
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? (isPreview ? 'preview' : '');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'EXPO_PUBLIC_SUPABASE_URL und EXPO_PUBLIC_SUPABASE_ANON_KEY müssen gesetzt sein (siehe .env.example).',
  );
}

/**
 * Supabase-Client der App. Kennt ausschließlich den öffentlichen Anon-Key;
 * Schreibzugriffe auf `unlocks` sind per RLS gesperrt und laufen nur über
 * die Edge Function `unlock` (AP6).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
