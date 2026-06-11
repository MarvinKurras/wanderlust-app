import { ensureSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

/** E-Mail-Upgrade des anonymen Kontos (A-AP8-2): Supabase verschickt eine Bestätigungs-Mail. */
export async function upgradeWithEmail(email: string): Promise<void> {
  await ensureSession();
  const { error } = await supabase.auth.updateUser({ email });
  if (error) {
    throw error;
  }
}

/** Löscht Konto + Unlocks serverseitig (Edge Function) und meldet lokal ab. */
export async function deleteAccount(): Promise<void> {
  await ensureSession();
  const { data, error } = await supabase.functions.invoke<{ ok: boolean }>('delete-account', {
    body: {},
  });
  if (error || !data?.ok) {
    throw error ?? new Error('delete failed');
  }
  await supabase.auth.signOut();
}
