-- =====================================================================
-- Secret Santa di Famiglia — 001_schema.sql
-- Schema completo: tabelle, funzioni, RLS, Storage.
-- Da eseguire UNA SOLA VOLTA nel SQL Editor di Supabase.
-- Le modifiche future vanno in nuovi file: 002_....sql, 003_....sql
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- PROFILI
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text not null unique check (username ~ '^[a-z0-9._-]{3,24}$'),
  display_name  text not null check (char_length(display_name) between 1 and 40),
  avatar_url    text,
  is_admin      boolean not null default false,
  participates  boolean not null default true,
  onboarded     boolean not null default false,
  created_at    timestamptz not null default now()
);

-- Scheda identikit (taglie, colori, allergie...)
create table if not exists public.profile_details (
  user_id        uuid primary key references public.profiles(id) on delete cascade,
  shirt_size     text,
  pants_size     text,
  shoe_size      text,
  fav_colors     text,
  allergies      text,
  no_gifts       text,
  extra_notes    text,
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- EVENTO (uno attivo per anno)
-- ---------------------------------------------------------------------
create table if not exists public.events (
  id               uuid primary key default gen_random_uuid(),
  name             text not null default 'Secret Santa di Famiglia',
  year             int  not null unique,
  budget_chf       numeric(8,2) not null default 50,
  exchange_at      timestamptz,
  location         text,
  reveal_at        timestamptz,
  exclusion_types  text[] not null default array['partner','genitore','figlio','fratello'],
  is_active        boolean not null default true,
  drawn_at         timestamptz,
  created_at       timestamptz not null default now()
);

-- Un solo evento attivo alla volta
create unique index if not exists events_one_active on public.events (is_active) where is_active;

-- ---------------------------------------------------------------------
-- RELAZIONI "Chi è per te?"
-- ---------------------------------------------------------------------
create table if not exists public.relationships (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  other_id   uuid not null references public.profiles(id) on delete cascade,
  rel_type   text not null check (rel_type in
              ('partner','genitore','figlio','fratello','nonno','nipote','zio','cugino','amico','altro')),
  created_at timestamptz not null default now(),
  primary key (user_id, other_id),
  check (user_id <> other_id)
);

-- ---------------------------------------------------------------------
-- ESTRAZIONE — il destinatario è CIFRATO (AES-256-GCM lato server).
-- Nessuna policy RLS: leggibile/scrivibile solo con la Service Role Key.
-- ---------------------------------------------------------------------
create table if not exists public.draws (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.events(id) on delete cascade,
  giver_id      uuid not null references public.profiles(id) on delete cascade,
  receiver_enc  text not null,           -- id destinatario cifrato
  scratched_at  timestamptz,
  created_at    timestamptz not null default now(),
  unique (event_id, giver_id)
);

-- ---------------------------------------------------------------------
-- WISHLIST
-- ---------------------------------------------------------------------
create table if not exists public.wishlist_items (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles(id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 160),
  url         text check (url is null or url ~* '^https?://'),
  image_url   text check (image_url is null or image_url ~* '^https?://'),
  store       text,
  price_chf   numeric(10,2) check (price_chf is null or price_chf >= 0),
  notes       text,
  is_top      boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists wishlist_owner_idx on public.wishlist_items(owner_id);

-- ---------------------------------------------------------------------
-- PRENOTAZIONI ANTI-DOPPIONE (tabella separata!)
-- ---------------------------------------------------------------------
create table if not exists public.claims (
  item_id      uuid primary key references public.wishlist_items(id) on delete cascade,
  claimer_id   uuid not null references public.profiles(id) on delete cascade,
  status       text not null default 'reserved' check (status in ('reserved','purchased')),
  reminded_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- SANTA MAIL — modello "casella postale".
-- Ogni messaggio viene scritto dal server in DUE copie: una per chi scrive
-- e una per chi riceve. Ogni utente legge solo le proprie copie
-- (owner_id = auth.uid()). La copia del destinatario NON contiene mai
-- l'ID del mittente: solo il ruolo (santa / recipient).
-- ---------------------------------------------------------------------
create table if not exists public.messages (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid not null references public.events(id) on delete cascade,
  owner_id     uuid not null references public.profiles(id) on delete cascade,
  box          text not null check (box in ('giftee','santa')), -- giftee = chat con chi ho pescato, santa = chat con il mio Babbo Natale
  sender_role  text not null check (sender_role in ('santa','recipient')),
  body         text not null check (char_length(body) between 1 and 1000),
  created_at   timestamptz not null default now()
);
create index if not exists messages_owner_idx on public.messages(owner_id, box, created_at);

-- ---------------------------------------------------------------------
-- NOTIFICHE PUSH
-- ---------------------------------------------------------------------
create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.notification_log (
  id         bigserial primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  kind       text not null,
  ref        text not null default '',
  sent_at    timestamptz not null default now(),
  unique (user_id, kind, ref)
);

-- =====================================================================
-- FUNZIONI DI SUPPORTO (security definer, evitano ricorsione RLS)
-- =====================================================================
create or replace function public.item_owner(p_item uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select owner_id from public.wishlist_items where id = p_item
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

-- Conteggio prenotazioni non visibile al proprietario: serve solo alla UI
-- di chi visita, quindi NON esponiamo nessuna funzione di conteggio pubblica.

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles           enable row level security;
alter table public.profile_details    enable row level security;
alter table public.events             enable row level security;
alter table public.relationships      enable row level security;
alter table public.draws              enable row level security;
alter table public.wishlist_items     enable row level security;
alter table public.claims             enable row level security;
alter table public.messages           enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notification_log   enable row level security;

-- PROFILES: tutti i membri loggati vedono i profili. Le modifiche passano
-- solo dalle API server (così nessuno può darsi is_admin da solo).
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated using (true);

-- PROFILE_DETAILS: lettura per tutti i membri, scrittura solo propria
drop policy if exists details_select on public.profile_details;
create policy details_select on public.profile_details
  for select to authenticated using (true);
drop policy if exists details_insert on public.profile_details;
create policy details_insert on public.profile_details
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists details_update on public.profile_details;
create policy details_update on public.profile_details
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- EVENTS: lettura per tutti, scrittura solo via API admin (service role)
drop policy if exists events_select on public.events;
create policy events_select on public.events
  for select to authenticated using (true);

-- RELATIONSHIPS: vedo quelle che ho dichiarato e quelle dove sono indicato
drop policy if exists rel_select on public.relationships;
create policy rel_select on public.relationships
  for select to authenticated using (user_id = auth.uid() or other_id = auth.uid());
drop policy if exists rel_insert on public.relationships;
create policy rel_insert on public.relationships
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists rel_update on public.relationships;
create policy rel_update on public.relationships
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists rel_delete on public.relationships;
create policy rel_delete on public.relationships
  for delete to authenticated using (user_id = auth.uid());

-- DRAWS: NESSUNA POLICY = nessun accesso da client. Solo service role.

-- WISHLIST: tutti leggono, solo il proprietario scrive
drop policy if exists wl_select on public.wishlist_items;
create policy wl_select on public.wishlist_items
  for select to authenticated using (true);
drop policy if exists wl_insert on public.wishlist_items;
create policy wl_insert on public.wishlist_items
  for insert to authenticated with check (owner_id = auth.uid());
drop policy if exists wl_update on public.wishlist_items;
create policy wl_update on public.wishlist_items
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists wl_delete on public.wishlist_items;
create policy wl_delete on public.wishlist_items
  for delete to authenticated using (owner_id = auth.uid());

-- CLAIMS: il PROPRIETARIO dell'oggetto NON vede MAI le prenotazioni
drop policy if exists claims_select on public.claims;
create policy claims_select on public.claims
  for select to authenticated
  using (public.item_owner(item_id) is distinct from auth.uid());
drop policy if exists claims_insert on public.claims;
create policy claims_insert on public.claims
  for insert to authenticated
  with check (claimer_id = auth.uid()
              and public.item_owner(item_id) is distinct from auth.uid()
              and status = 'reserved');
drop policy if exists claims_update on public.claims;
create policy claims_update on public.claims
  for update to authenticated
  using (claimer_id = auth.uid())
  with check (claimer_id = auth.uid() and public.item_owner(item_id) is distinct from auth.uid());
drop policy if exists claims_delete on public.claims;
create policy claims_delete on public.claims
  for delete to authenticated using (claimer_id = auth.uid());

-- MESSAGES: leggo solo le mie copie. Scrittura solo via API (service role).
drop policy if exists msg_select on public.messages;
create policy msg_select on public.messages
  for select to authenticated using (owner_id = auth.uid());

-- PUSH: nessun accesso da client (gestito dalle API)
-- NOTIFICATION_LOG: nessun accesso da client

-- Permessi di colonna aggiuntivi: il client non può aggiornare profiles
revoke insert, update, delete on public.profiles from anon, authenticated;
revoke all on public.draws from anon, authenticated;
revoke all on public.push_subscriptions from anon, authenticated;
revoke all on public.notification_log from anon, authenticated;
revoke insert, update, delete on public.messages from anon, authenticated;
revoke insert, update, delete on public.events from anon, authenticated;

-- Trigger updated_at per claims
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists claims_touch on public.claims;
create trigger claims_touch before update on public.claims
  for each row execute function public.touch_updated_at();

-- Impedisce di cambiare item_id / claimer_id con un update
create or replace function public.claims_guard()
returns trigger language plpgsql as $$
begin
  if new.item_id <> old.item_id or new.claimer_id <> old.claimer_id then
    raise exception 'Non consentito';
  end if;
  return new;
end $$;
drop trigger if exists claims_guard_trg on public.claims;
create trigger claims_guard_trg before update on public.claims
  for each row execute function public.claims_guard();

-- =====================================================================
-- REALTIME: abilita la tabella messages (Santa Mail) e claims
-- =====================================================================
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.claims;
exception when duplicate_object then null; when undefined_object then null; end $$;

-- =====================================================================
-- STORAGE: bucket pubblico "avatars" (upload solo via API server)
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 1048576, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 1048576;

-- =====================================================================
-- EVENTO INIZIALE (modificabile dal Pannello Admin)
-- =====================================================================
insert into public.events (name, year, budget_chf, exchange_at, location, reveal_at)
values ('Secret Santa di Famiglia', extract(year from now())::int, 50,
        make_timestamptz(extract(year from now())::int, 12, 24, 18, 0, 0, 'Europe/Zurich'),
        'Da definire',
        make_timestamptz(extract(year from now())::int, 12, 24, 20, 0, 0, 'Europe/Zurich'))
on conflict (year) do nothing;
