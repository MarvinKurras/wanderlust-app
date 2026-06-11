import { supabase } from './supabase';

/** Region oder Unterregion (Tabelle `regions`; parent_id = Elternregion). */
export type Region = {
  id: string;
  name: string;
  parent_id: string | null;
  active: boolean;
};

/** Lädt alle aktiven Regionen (RLS filtert auf `active`). */
export async function fetchRegions(): Promise<Region[]> {
  const { data, error } = await supabase.from('regions').select('*').order('name');
  if (error) {
    throw error;
  }
  return (data ?? []) as Region[];
}
