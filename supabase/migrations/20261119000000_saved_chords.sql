-- "My chords": chord diagrams a user saved to their account, styles included.

create table public.saved_chords (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 200),
  chart jsonb not null check (octet_length(chart::text) <= 50000),
  -- PostgREST can't order by an expression, so sort by name through this column.
  name_sort text generated always as (lower(name)) stored,
  created_at timestamptz not null default now()
);

create index saved_chords_user_created_idx on public.saved_chords (user_id, created_at desc, id);
create index saved_chords_user_name_idx on public.saved_chords (user_id, name_sort, id);

alter table public.saved_chords enable row level security;

create policy "Can view own saved chords." on public.saved_chords
  for select using (auth.uid() = user_id);
create policy "Can save own chords." on public.saved_chords
  for insert with check (auth.uid() = user_id);
create policy "Can rename own saved chords." on public.saved_chords
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Can delete own saved chords." on public.saved_chords
  for delete using (auth.uid() = user_id);

-- Only the name can change after saving.
revoke update, truncate on public.saved_chords from anon, authenticated;
grant update (name) on public.saved_chords to authenticated;

-- Free accounts keep up to 3 chords; Pro is unlimited. Same Pro check as
-- useSubscription: an active or trialing subscription to "Chordpic Pro".
create function public.enforce_saved_chords_limit() returns trigger
  language plpgsql security definer set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(hashtext('saved_chords:' || new.user_id::text));

  if exists (
    select 1
    from subscriptions s
    join prices p on p.id = s.price_id
    join products pr on pr.id = p.product_id
    where s.user_id = new.user_id
      and s.status in ('trialing', 'active')
      and pr.name = 'Chordpic Pro'
  ) then
    return new;
  end if;

  if (select count(*) from saved_chords where user_id = new.user_id) >= 3 then
    raise exception 'SAVED_CHORDS_LIMIT' using errcode = 'P0001',
      hint = 'Free accounts can save up to 3 chords.';
  end if;

  return new;
end;
$$;

create trigger saved_chords_limit
  before insert on public.saved_chords
  for each row execute function public.enforce_saved_chords_limit();
