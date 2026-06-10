import { supabase } from './supabase';

/**
 * Stellt eine Session sicher: vorhandene (persistierte) Session weiterverwenden,
 * sonst anonym anmelden (Projektplan §10 — anonyme Auth als Default,
 * E-Mail-Upgrade folgt in AP8).
 */
export async function ensureSession(): Promise<string> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    throw sessionError;
  }
  if (sessionData.session) {
    return sessionData.session.user.id;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    throw error;
  }
  if (!data.user) {
    throw new Error('Anonyme Anmeldung lieferte keinen Nutzer.');
  }
  return data.user.id;
}
