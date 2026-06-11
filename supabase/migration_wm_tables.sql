-- WM 2026 Tipping Game — isolated from main app tables

create table if not exists wm_users (
  id           uuid primary key default gen_random_uuid(),
  email        text unique not null,
  username     text unique not null,
  password_hash text not null,
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now()
);

create table if not exists wm_tips (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references wm_users(id) on delete cascade,
  match_id        integer not null,
  home_goals      integer not null,
  away_goals      integer not null,
  points_awarded  integer,
  created_at      timestamptz not null default now(),
  constraint wm_tips_user_match_unique unique (user_id, match_id)
);

create table if not exists wm_matches_cache (
  match_id        integer primary key,
  home_team       text not null,
  away_team       text not null,
  home_team_flag  text,
  away_team_flag  text,
  utc_date        timestamptz not null,
  status          text not null default 'SCHEDULED',
  home_score      integer,
  away_score      integer,
  matchday        integer,
  stage           text,
  last_updated    timestamptz not null default now()
);

create index if not exists wm_tips_user_id_idx   on wm_tips(user_id);
create index if not exists wm_tips_match_id_idx  on wm_tips(match_id);
create index if not exists wm_matches_status_idx on wm_matches_cache(status);
create index if not exists wm_matches_date_idx   on wm_matches_cache(utc_date);
