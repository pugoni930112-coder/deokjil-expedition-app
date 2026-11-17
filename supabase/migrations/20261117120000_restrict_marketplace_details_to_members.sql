revoke select (desired_item, item_condition, price_krw, description)
  on public.fan_marketplace_posts from anon;

grant select (id, listing_type, artist_name, item_name, status, created_at)
  on public.fan_marketplace_posts to anon;
