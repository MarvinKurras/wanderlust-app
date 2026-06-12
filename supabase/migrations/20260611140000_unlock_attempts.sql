-- AP9: Versuchsprotokoll für das Unlock-Rate-Limit (§10: max. 10 Versuche/h/Nutzer).
-- Nur die Edge Function (Service Role) liest/schreibt; Clients haben keinerlei Zugriff.

create table public.unlock_attempts (
  id           bigint generated always as identity primary key,
  user_id      uuid not null,
  place_id     text not null,
  attempted_at timestamptz not null default now()
);

comment on table public.unlock_attempts is
  'Unlock-Versuche für Rate Limiting (AP9). Kein FK auf auth.users, damit Versuche gelöschter Konten als Missbrauchssignal erhalten bleiben können; Aufräumjob ist Ausbaustufe.';

create index unlock_attempts_user_time
  on public.unlock_attempts (user_id, attempted_at desc);

alter table public.unlock_attempts enable row level security;
-- bewusst keine Policies: Clients können weder lesen noch schreiben
revoke all on public.unlock_attempts from anon, authenticated;
