import type { BadgeTone } from '@/theme';

import { supabase } from './supabase';

export type BadgeMotif = 'peak' | 'twin' | 'lake' | 'cliff' | 'forest' | 'tower';
export type BadgeShape = 'shield' | 'arch' | 'oval';

/** Ein Wanderlust-Ort (Tabelle `places`, Projektplan §7). */
export type Place = {
  id: string;
  name: string;
  region: string;
  type: string;
  description: string;
  elevation_m: number;
  lat: number;
  lng: number;
  unlock_radius_m: number;
  badge_motif: BadgeMotif;
  badge_shape: BadgeShape;
  badge_tone: BadgeTone;
  active: boolean;
};

/** Lädt alle aktiven Orte, höchste zuerst (RLS filtert auf `active`). */
export async function fetchPlaces(): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .order('elevation_m', { ascending: false });

  if (error) {
    throw error;
  }
  return (data ?? []) as Place[];
}
