create table public.expedition_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('콘서트', '무대인사', '팝업스토어', '기타')),
  title text not null,
  subtitle text not null default 'OUR FAN JOURNEY',
  event_date date not null,
  place text not null,
  review text not null default '',
  image_path text,
  created_at timestamptz not null default now()
);

create index expedition_records_user_date_idx
  on public.expedition_records (user_id, event_date desc, created_at desc);

alter table public.expedition_records enable row level security;
grant select, insert, update, delete on public.expedition_records to authenticated;

create policy "Users can read their own expedition records"
  on public.expedition_records for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own expedition records"
  on public.expedition_records for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own expedition records"
  on public.expedition_records for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own expedition records"
  on public.expedition_records for delete to authenticated
  using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public)
values ('expedition-record-photos', 'expedition-record-photos', false);

grant select, insert, update, delete on storage.objects to authenticated;

create policy "Users can read their own expedition record photos"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'expedition-record-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can upload their own expedition record photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'expedition-record-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can update their own expedition record photos"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'expedition-record-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'expedition-record-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete their own expedition record photos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'expedition-record-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
