-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New query)

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  tailor_count integer default 0 not null,
  is_pro boolean default false not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

-- Tailor history
create table public.tailor_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  original_resume text not null,
  job_description text not null,
  tailored_resume text not null,
  cover_letter text not null,
  match_score integer,
  missing_keywords text[],
  improvements text[],
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.tailor_history enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can view own history"
  on public.tailor_history for select using (auth.uid() = user_id);

create policy "Users can insert own history"
  on public.tailor_history for insert with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
