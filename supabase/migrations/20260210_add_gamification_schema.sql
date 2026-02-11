-- Migration: Add Gamification Columns and Chat History
-- Upgrades 'profiles' table with RPG stats and creates 'chat_history' for AI memory.
-- Made idempotent (safe to re-run)

-- 1. Add RPG Stats to 'profiles' table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INT DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_xp INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS character_class TEXT DEFAULT 'novice';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_energy INT DEFAULT 10;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS max_energy INT DEFAULT 10;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gold INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gems INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS achievements TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 2. Create 'chat_history' table for Long Term Memory
CREATE TABLE IF NOT EXISTS public.chat_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('user', 'assistant', 'system')) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS on 'chat_history'
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- 4. Idempotent policies for 'chat_history'
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own chat history" ON public.chat_history;
  CREATE POLICY "Users can view their own chat history"
    ON public.chat_history FOR SELECT
    USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can insert their own chat messages" ON public.chat_history;
  CREATE POLICY "Users can insert their own chat messages"
    ON public.chat_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);
END $$;

-- 5. Idempotent policy for profiles gamification stats
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update their own gamification stats" ON public.profiles;
  CREATE POLICY "Users can update their own gamification stats"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);
END $$;
