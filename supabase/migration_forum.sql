-- ─── Forum Tables ─────────────────────────────────────────────────────────────

create table if not exists forum_posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  title       text not null check (char_length(title) between 5 and 200),
  body        text not null check (char_length(body) >= 20),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists forum_replies (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references forum_posts(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  body        text not null check (char_length(body) >= 5),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists forum_votes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  post_id     uuid references forum_posts(id) on delete cascade,
  reply_id    uuid references forum_replies(id) on delete cascade,
  value       smallint not null check (value in (1, -1)),
  created_at  timestamptz not null default now(),
  constraint  vote_exactly_one_target check (
    (post_id is null) != (reply_id is null)
  )
);

-- One vote per user per post (ignoring rows where post_id is null)
create unique index if not exists forum_votes_post_unique
  on forum_votes(user_id, post_id) where post_id is not null;

-- One vote per user per reply (ignoring rows where reply_id is null)
create unique index if not exists forum_votes_reply_unique
  on forum_votes(user_id, reply_id) where reply_id is not null;

create table if not exists forum_tags (
  id    uuid primary key default gen_random_uuid(),
  name  text not null unique
);

create table if not exists forum_post_tags (
  post_id  uuid not null references forum_posts(id) on delete cascade,
  tag_id   uuid not null references forum_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- ─── updated_at Trigger ───────────────────────────────────────────────────────

create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger forum_posts_updated_at
  before update on forum_posts
  for each row execute function update_updated_at_column();

create trigger forum_replies_updated_at
  before update on forum_replies
  for each row execute function update_updated_at_column();

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table forum_posts     enable row level security;
alter table forum_replies   enable row level security;
alter table forum_votes     enable row level security;
alter table forum_tags      enable row level security;
alter table forum_post_tags enable row level security;

-- Public read
create policy "forum_posts_select"     on forum_posts     for select using (true);
create policy "forum_replies_select"   on forum_replies   for select using (true);
create policy "forum_votes_select"     on forum_votes     for select using (true);
create policy "forum_tags_select"      on forum_tags      for select using (true);
create policy "forum_post_tags_select" on forum_post_tags for select using (true);

-- forum_posts: own rows only
create policy "forum_posts_insert" on forum_posts for insert
  with check (auth.uid() = user_id);
create policy "forum_posts_update" on forum_posts for update
  using (auth.uid() = user_id);
create policy "forum_posts_delete" on forum_posts for delete
  using (auth.uid() = user_id);

-- forum_replies: own rows only
create policy "forum_replies_insert" on forum_replies for insert
  with check (auth.uid() = user_id);
create policy "forum_replies_update" on forum_replies for update
  using (auth.uid() = user_id);
create policy "forum_replies_delete" on forum_replies for delete
  using (auth.uid() = user_id);

-- forum_votes: authenticated users, own rows
create policy "forum_votes_insert" on forum_votes for insert
  with check (auth.uid() = user_id);
create policy "forum_votes_update" on forum_votes for update
  using (auth.uid() = user_id);
create policy "forum_votes_delete" on forum_votes for delete
  using (auth.uid() = user_id);

-- forum_post_tags: post owner can manage
create policy "forum_post_tags_insert" on forum_post_tags for insert
  with check (
    exists (select 1 from forum_posts where id = post_id and user_id = auth.uid())
  );
create policy "forum_post_tags_delete" on forum_post_tags for delete
  using (
    exists (select 1 from forum_posts where id = post_id and user_id = auth.uid())
  );

-- ─── Default Tags ─────────────────────────────────────────────────────────────

insert into forum_tags (name) values
  ('Simson'),
  ('Schwalbe'),
  ('MZ'),
  ('Tuning'),
  ('Reparatur'),
  ('Suche/Biete'),
  ('Elektrik'),
  ('Allgemein')
on conflict (name) do nothing;
