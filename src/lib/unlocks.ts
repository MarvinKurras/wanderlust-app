import { supabase } from './supabase';

/** Eine Freischaltung des angemeldeten Nutzers (Tabelle `unlocks`, RLS: nur eigene). */
export type Unlock = {
  place_id: string;
  unlocked_at: string;
};

/** Lädt die eigenen Freischaltungen (RLS filtert auf den angemeldeten Nutzer). */
export async function fetchUnlocks(): Promise<Unlock[]> {
  const { data, error } = await supabase.from('unlocks').select('place_id, unlocked_at');
  if (error) {
    throw error;
  }
  return (data ?? []) as Unlock[];
}
