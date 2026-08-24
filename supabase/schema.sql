create table if not exists public.leave_entries (
  id uuid primary key default gen_random_uuid(),
  employee_name text not null check (length(trim(employee_name)) > 0),
  start_date date not null,
  end_date date not null,
  leave_type text not null check (leave_type in ('Casual', 'Sick', 'Vacation')),
  status text not null default 'Pending' check (status in ('Pending', 'Approved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leave_dates_are_ordered check (end_date >= start_date)
);

alter table public.leave_entries enable row level security;

create policy "public users can read leave"
  on public.leave_entries for select to anon, authenticated using (true);

create policy "public users can add leave"
  on public.leave_entries for insert to anon, authenticated with check (start_date >= current_date);

create policy "public users can update future leave"
  on public.leave_entries for update to anon, authenticated
  using (end_date >= current_date)
  with check (start_date >= current_date);

create or replace function public.prevent_past_leave_mutation()
returns trigger language plpgsql security invoker as $$
begin
  if old.end_date < current_date then
    raise exception 'Past leave is read-only';
  end if;
  return new;
end;
$$;

drop trigger if exists leave_entries_past_guard on public.leave_entries;
create trigger leave_entries_past_guard
before update or delete on public.leave_entries
for each row execute function public.prevent_past_leave_mutation();
