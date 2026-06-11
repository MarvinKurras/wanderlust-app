-- AP-R: Regionen/Unterregionen (selbstreferenzierend, beliebig tief erweiterbar).
-- RLS-Muster wie places: lesbar für Clients (nur aktiv), Schreiben nur serverseitig.

create table public.regions (
  id        text primary key,
  name      text not null,
  parent_id text references public.regions (id),
  active    boolean not null default true,
  check (id <> parent_id)
);

comment on table public.regions is
  'Regionen und Unterregionen (parent_id = Elternregion). Abschluss-Badge-Felder sind bewusst Ausbaustufe.';

-- Orte optional einer (Unter-)Region zuordnen; Alt-Orte bleiben ohne Zuordnung gültig.
alter table public.places
  add column region_id text references public.regions (id);

comment on column public.places.region_id is
  'Strukturelle Regionszuordnung (regions.id); das Freitext-Feld region bleibt die Anzeige.';

-- ---------- RLS (Muster aus 20260610120000) ----------
alter table public.regions enable row level security;

create policy regions_select_active
  on public.regions for select
  to anon, authenticated
  using (active);

revoke insert, update, delete on public.regions from anon, authenticated;
