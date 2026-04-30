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
-- Row Level Security
-- ============================================================

alter table players enable row level security;
alter table rounds enable row level security;
alter table teams enable row level security;
alter table dot_events enable row level security;
alter table photos enable row level security;

-- All authenticated users can read everything
create policy "Authenticated users can read players"
  on players for select
  to authenticated
  using (true);

create policy "Authenticated users can read rounds"
  on rounds for select
  to authenticated
  using (true);

create policy "Authenticated users can read teams"
  on teams for select
  to authenticated
  using (true);

create policy "Authenticated users can read dot_events"
  on dot_events for select
  to authenticated
  using (true);

create policy "Authenticated users can read photos"
  on photos for select
  to authenticated
  using (true);

-- Authenticated users can insert their own data
create policy "Authenticated users can insert players"
  on players for insert
  to authenticated
  with check (true);

create policy "Authenticated users can insert rounds"
  on rounds for insert
  to authenticated
  with check (true);

create policy "Authenticated users can insert teams"
  on teams for insert
  to authenticated
  with check (true);

create policy "Authenticated users can insert dot_events"
  on dot_events for insert
  to authenticated
  with check (true);

create policy "Authenticated users can insert photos"
  on photos for insert
  to authenticated
  with check (true);

-- ============================================================
-- Realtime
-- ============================================================

alter publication supabase_realtime add table dot_events;
alter publication supabase_realtime add table teams;
