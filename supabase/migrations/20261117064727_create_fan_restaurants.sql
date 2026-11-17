create table public.fan_restaurants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  address text not null default '' check (char_length(address) <= 250),
  category text not null default '맛집' check (category in ('맛집', '카페', '팝업스토어', '기타')),
  description text not null default '' check (char_length(description) <= 1200),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  created_at timestamptz not null default now()
);

create index fan_restaurants_created_at_idx
  on public.fan_restaurants (created_at desc);

alter table public.fan_restaurants enable row level security;

create policy "Anyone can view fan restaurants"
  on public.fan_restaurants for select
  to anon, authenticated
  using (true);

create policy "Members can add fan restaurants"
  on public.fan_restaurants for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Members can update their own fan restaurants"
  on public.fan_restaurants for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Members can delete their own fan restaurants"
  on public.fan_restaurants for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.fan_restaurants from anon, authenticated;
grant select (id, name, address, category, description, latitude, longitude, created_at)
  on public.fan_restaurants to anon, authenticated;
grant insert (user_id, name, address, category, description, latitude, longitude)
  on public.fan_restaurants to authenticated;
grant update (name, address, category, description, latitude, longitude)
  on public.fan_restaurants to authenticated;
grant delete on public.fan_restaurants to authenticated;
