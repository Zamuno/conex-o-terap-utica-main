
-- Create user_preferences table
create table public.user_preferences (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  email_notifications boolean default true,
  marketing_emails boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create communication_logs table
create table public.communication_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null, -- 'past_due', 'reactivated', 'canceled'
  channel text not null default 'email',
  status text not null, -- 'sent', 'failed', 'opt_out'
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.user_preferences enable row level security;
alter table public.communication_logs enable row level security;

create policy "Users can view their own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can update their own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);

-- Logs are typically admin read-only or strictly backend insert
create policy "Users can view their own logs"
  on public.communication_logs for select
  using (auth.uid() = user_id);

-- Insert triggering function for new profiles to have default preferences
create or replace function public.handle_new_user_preferences()
returns trigger as $$
begin
  insert into public.user_preferences (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create preferences on profile creation
create trigger on_profile_created_preferences
  after insert on public.profiles
  for each row execute procedure public.handle_new_user_preferences();

-- Backfill existing users
insert into public.user_preferences (user_id)
select id from public.profiles
on conflict do nothing;
