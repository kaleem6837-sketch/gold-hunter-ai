
-- Roles enum + table
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "users view own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "admins view all roles" on public.user_roles for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  language text not null default 'en',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles select own" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles update own" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "profiles insert own" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- Auto-create profile + default role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  insert into public.user_settings (user_id) values (new.id);
  return new;
end; $$;

-- User settings
create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  risk_percent numeric not null default 1.0,
  enable_smc boolean not null default true,
  enable_crt boolean not null default true,
  enable_patterns boolean not null default true,
  enable_multi_tf boolean not null default true,
  premium_tier text not null default 'free',
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.user_settings enable row level security;
create policy "settings own select" on public.user_settings for select to authenticated using (auth.uid() = user_id);
create policy "settings own update" on public.user_settings for update to authenticated using (auth.uid() = user_id);
create policy "settings own insert" on public.user_settings for insert to authenticated with check (auth.uid() = user_id);

-- Signals
create table public.signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pair text not null default 'XAUUSD',
  signal text not null check (signal in ('BUY', 'SELL', 'WAIT')),
  confidence integer not null default 0,
  timeframe text,
  entry_price numeric,
  stop_loss numeric,
  take_profit_1 numeric,
  take_profit_2 numeric,
  pattern text,
  reasoning jsonb not null default '[]'::jsonb,
  confirmations jsonb not null default '{}'::jsonb,
  chart_image_path text,
  raw_analysis jsonb,
  outcome text,
  created_at timestamptz not null default now()
);
alter table public.signals enable row level security;
create policy "signals own select" on public.signals for select to authenticated using (auth.uid() = user_id);
create policy "signals admin select" on public.signals for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "signals own insert" on public.signals for insert to authenticated with check (auth.uid() = user_id);
create policy "signals own update" on public.signals for update to authenticated using (auth.uid() = user_id);
create policy "signals own delete" on public.signals for delete to authenticated using (auth.uid() = user_id);
create index on public.signals (user_id, created_at desc);

-- Watchlist
create table public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pair text not null,
  created_at timestamptz not null default now(),
  unique (user_id, pair)
);
alter table public.watchlist enable row level security;
create policy "wl own select" on public.watchlist for select to authenticated using (auth.uid() = user_id);
create policy "wl own insert" on public.watchlist for insert to authenticated with check (auth.uid() = user_id);
create policy "wl own delete" on public.watchlist for delete to authenticated using (auth.uid() = user_id);

-- Trigger on auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage bucket for chart screenshots (private)
insert into storage.buckets (id, name, public) values ('charts', 'charts', false);

create policy "charts user read own" on storage.objects for select to authenticated
  using (bucket_id = 'charts' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "charts user upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'charts' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "charts user delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'charts' and (storage.foldername(name))[1] = auth.uid()::text);
