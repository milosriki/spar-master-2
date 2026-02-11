-- Spark Mastery Supabase Schema

-- 1. PROFILES (Gamification State)
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  username text,
  
  -- Gamification Stats
  level int default 1,
  current_hp int default 100,
  max_hp int default 100,
  xp int default 0,
  gold int default 0,
  gems int default 0,
  current_streak int default 0,
  
  -- Character
  character_class text default 'warrior', -- warrior, mage, healer, rogue
  avatar_url text,
  
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. HABITS (Core Loop)
create table habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  notes text,
  
  -- Logic
  type text default 'daily', -- daily, habit, todo
  frequency text default 'daily', -- daily, weekdays, weekends
  difficulty text default 'medium',
  
  -- Gamification Rewards
  xp_reward int default 10,
  gold_reward int default 5,
  description text,
  
  -- State
  streak int default 0,
  is_complete_today boolean default false,
  last_completed_at timestamp with time zone,
  
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. INVENTORY (Rewards)
create table inventory (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  item_id text not null, -- e.g., 'flame-blade'
  item_type text not null, -- weapon, armor, reward
  is_equipped boolean default false,
  purchased_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. LEADS (Already exists, but defining for completeness)
create table if not exists spark_leads (
    id uuid default uuid_generate_v4() primary key,
    name text,
    email text,
    phone text,
    fitness_goal text,
    age_range text,
    lead_source text,
    lead_score int,
    status text default 'new',
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS Policies (Simplified for prototype)
alter table profiles enable row level security;
alter table habits enable row level security;
alter table inventory enable row level security;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Users can view own habits" on habits for select using (auth.uid() = user_id);
create policy "Users can insert own habits" on habits for insert with check (auth.uid() = user_id);
create policy "Users can update own habits" on habits for update using (auth.uid() = user_id);

create policy "Users can view own inventory" on inventory for select using (auth.uid() = user_id);
create policy "Users can insert own inventory" on inventory for insert with check (auth.uid() = user_id);
