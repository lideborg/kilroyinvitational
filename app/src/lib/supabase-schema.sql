-- ============================================================
-- The Kilroy Invitational - Supabase Schema
-- ============================================================

-- Players
create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  handicap int default 0,
  avatar_url text,
  created_at timestamptz default now()
);

-- Rounds
create table rounds (
  id uuid primary key default gen_random_uuid(),
  day smallint not null,
  format text not null,
  course_name text,
  created_at timestamptz default now()
);

-- Teams
create table teams (
  id uuid primary key default gen_random_uuid(),
  round_id uuid references rounds(id) on delete cascade,
  player1_id uuid references players(id) on delete cascade,
  player2_id uuid references players(id) on delete cascade,
  team_handicap numeric default 0,
  gross_score int,
  net_score int
);

-- Dot Events
create table dot_events (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  round_id uuid references rounds(id) on delete set null,
  dot_type text not null,
  value int not null,
  description text,
  created_at timestamptz default now()
);

-- Photos
create table photos (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  url text not null,
  caption text,
  day smallint,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security — anonymous read, anon write (PIN in app)
-- ============================================================

alter table players enable row level security;
alter table rounds enable row level security;
alter table teams enable row level security;
alter table dot_events enable row level security;
alter table photos enable row level security;

-- Everyone can read everything (no login needed)
create policy "Anyone can read players" on players for select to anon, authenticated using (true);
create policy "Anyone can read rounds" on rounds for select to anon, authenticated using (true);
create policy "Anyone can read teams" on teams for select to anon, authenticated using (true);
create policy "Anyone can read dot_events" on dot_events for select to anon, authenticated using (true);
create policy "Anyone can read photos" on photos for select to anon, authenticated using (true);

-- Anon can insert/update (PIN check happens in the app)
create policy "Anon can insert players" on players for insert to anon with check (true);
create policy "Anon can update players" on players for update to anon using (true);
create policy "Anon can insert rounds" on rounds for insert to anon with check (true);
create policy "Anon can insert teams" on teams for insert to anon with check (true);
create policy "Anon can update teams" on teams for update to anon using (true);
create policy "Anon can insert dot_events" on dot_events for insert to anon with check (true);
create policy "Anon can insert photos" on photos for insert to anon with check (true);

-- ============================================================
-- Realtime
-- ============================================================

alter publication supabase_realtime add table dot_events;
alter publication supabase_realtime add table teams;
alter publication supabase_realtime add table players;

-- ============================================================
-- Seed data — players and rounds
-- ============================================================

insert into players (name, handicap) values
  ('Sam', 12),
  ('Nick', 14),
  ('Garrett', 10),
  ('Mateen', 20),
  ('Dean', 18),
  ('Dan', 16),
  ('Karmali', 22),
  ('Hampus', 24);

insert into rounds (day, format, course_name) values
  (1, 'shamble', 'Omni National'),
  (2, 'scramble', 'Omni International'),
  (3, 'scramble_hybrid', 'Celebration Golf Club');
