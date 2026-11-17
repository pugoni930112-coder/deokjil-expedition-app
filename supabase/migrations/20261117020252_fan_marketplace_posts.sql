create table public.fan_marketplace_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  listing_type text not null check (listing_type in ('photocard_exchange', 'goods_sale')),
  artist_name text not null default '도경수 · EXO' check (char_length(artist_name) between 1 and 60),
  item_name text not null check (char_length(item_name) between 1 and 100),
  desired_item text check (desired_item is null or char_length(desired_item) <= 120),
  item_condition text not null check (item_condition in ('미개봉', '새상품', '상태 좋음', '사용감 있음')),
  price_krw integer,
  description text not null default '' check (char_length(description) <= 1200),
  status text not null default 'open' check (status in ('open', 'reserved', 'completed')),
  created_at timestamptz not null default now(),
  constraint fan_marketplace_price_by_type check (
    (listing_type = 'goods_sale' and price_krw is not null and price_krw > 0)
    or (listing_type = 'photocard_exchange' and (price_krw is null or price_krw >= 0))
  )
);

create index fan_marketplace_posts_browse_idx
  on public.fan_marketplace_posts (listing_type, status, created_at desc);

alter table public.fan_marketplace_posts enable row level security;

create policy "Anyone can view active marketplace posts"
  on public.fan_marketplace_posts for select
  to anon
  using (status in ('open', 'reserved'));

create policy "Users can view active posts and their own posts"
  on public.fan_marketplace_posts for select
  to authenticated
  using (status in ('open', 'reserved') or (select auth.uid()) = user_id);

create policy "Users can create marketplace posts as themselves"
  on public.fan_marketplace_posts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own marketplace posts"
  on public.fan_marketplace_posts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own marketplace posts"
  on public.fan_marketplace_posts for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.fan_marketplace_posts from anon, authenticated;
grant select (
  id, listing_type, artist_name, item_name, desired_item, item_condition,
  price_krw, description, status, created_at
) on public.fan_marketplace_posts to anon, authenticated;
grant insert (
  user_id, listing_type, artist_name, item_name, desired_item, item_condition,
  price_krw, description
) on public.fan_marketplace_posts to authenticated;
grant update (
  listing_type, artist_name, item_name, desired_item, item_condition,
  price_krw, description, status
) on public.fan_marketplace_posts to authenticated;
grant delete on public.fan_marketplace_posts to authenticated;
