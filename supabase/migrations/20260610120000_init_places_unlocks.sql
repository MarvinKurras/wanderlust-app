-- AP3: Schema + RLS für Wanderlust (Projektplan §7, §10)
-- Orte sind öffentlich lesbar; Freischaltungen schreibt ausschließlich
-- die Edge Function `unlock` (Service Role, AP6) — Clients niemals direkt.

create table public.places (
  id              text primary key,
  name            text not null,
  region          text not null,
  type            text not null,
  description     text not null,
  elevation_m     integer not null,
  lat             double precision not null,
  lng             double precision not null,
  unlock_radius_m integer not null default 250
                  check (unlock_radius_m between 100 and 1000),
  badge_motif     text not null check (badge_motif in ('peak','twin','lake','cliff','forest','tower')),
  badge_shape     text not null check (badge_shape in ('shield','arch','oval')),
  badge_tone      text not null check (badge_tone in ('brass','silver','copper','pewter')),
  active          boolean not null default true
);

comment on table public.places is
  'Wanderlust-Orte. lat/lng = Freischaltpunkt (WGS84) — vor Release pro Ort manuell verifizieren (docs/Koordinaten-Checkliste.md).';

create table public.unlocks (
  user_id     uuid not null references auth.users (id) on delete cascade,
  place_id    text not null references public.places (id),
  unlocked_at timestamptz not null default now(),
  lat         double precision not null,
  lng         double precision not null,
  accuracy_m  double precision not null,
  distance_m  double precision not null,
  primary key (user_id, place_id)
);

comment on table public.unlocks is
  'Freischaltungen inkl. Standort-Snapshot (Audit/Anti-Cheat, Projektplan §10). Schreibzugriff nur über Edge Function unlock.';

-- ---------- RLS ----------
alter table public.places enable row level security;
alter table public.unlocks enable row level security;

-- Orte: für alle Clients lesbar, aber nur aktive
create policy places_select_active
  on public.places for select
  to anon, authenticated
  using (active);

-- Freischaltungen: jeder sieht nur seine eigenen; kein Client-Schreibzugriff
-- (keine insert/update/delete-Policies — Edge Function nutzt Service Role und umgeht RLS)
create policy unlocks_select_own
  on public.unlocks for select
  to authenticated
  using (auth.uid() = user_id);

-- Defense in depth: Schreibprivilegien für Client-Rollen zusätzlich entziehen
revoke insert, update, delete on public.places from anon, authenticated;
revoke insert, update, delete on public.unlocks from anon, authenticated;
