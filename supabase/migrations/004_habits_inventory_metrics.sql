-- =============================================
-- Migration 004: Create habits + inventory + ai_metrics tables
-- These were in schema.sql but never migrated to live DB
-- Made idempotent (safe to re-run)
-- =============================================

-- 1. HABITS (Core Loop)
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,

  -- Logic
  type TEXT DEFAULT 'daily', -- daily, habit, todo
  frequency TEXT DEFAULT 'daily', -- daily, weekdays, weekends
  difficulty TEXT DEFAULT 'medium',

  -- Gamification Rewards
  xp_reward INT DEFAULT 10,
  gold_reward INT DEFAULT 5,
  description TEXT,

  -- State
  streak INT DEFAULT 0,
  is_complete_today BOOLEAN DEFAULT false,
  last_completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. INVENTORY (Rewards)
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id TEXT NOT NULL, -- e.g., 'flame-blade'
  item_type TEXT NOT NULL, -- weapon, armor, reward
  is_equipped BOOLEAN DEFAULT false,
  purchased_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- 4. Idempotent policies for habits
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own habits" ON public.habits;
  CREATE POLICY "Users can view own habits" ON public.habits
    FOR SELECT USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can insert own habits" ON public.habits;
  CREATE POLICY "Users can insert own habits" ON public.habits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can update own habits" ON public.habits;
  CREATE POLICY "Users can update own habits" ON public.habits
    FOR UPDATE USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can delete own habits" ON public.habits;
  CREATE POLICY "Users can delete own habits" ON public.habits
    FOR DELETE USING (auth.uid() = user_id);
END $$;

-- 5. Idempotent policies for inventory
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own inventory" ON public.inventory;
  CREATE POLICY "Users can view own inventory" ON public.inventory
    FOR SELECT USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can insert own inventory" ON public.inventory;
  CREATE POLICY "Users can insert own inventory" ON public.inventory
    FOR INSERT WITH CHECK (auth.uid() = user_id);
END $$;

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_user_complete ON public.habits(user_id, is_complete_today);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON public.inventory(user_id);

-- 7. AI Metrics table (P2)
CREATE TABLE IF NOT EXISTS public.ai_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  latency_ms INT,
  model TEXT DEFAULT 'gemini-2.0-flash',
  fallback_used BOOLEAN DEFAULT false,
  memory_count INT DEFAULT 0,
  conversation_length INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ai_metrics ENABLE ROW LEVEL SECURITY;

-- Idempotent policies for ai_metrics
DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role full access on ai_metrics" ON public.ai_metrics;
  CREATE POLICY "Service role full access on ai_metrics"
    ON public.ai_metrics FOR ALL
    USING (auth.role() = 'service_role');

  DROP POLICY IF EXISTS "Users can view own metrics" ON public.ai_metrics;
  CREATE POLICY "Users can view own metrics"
    ON public.ai_metrics FOR SELECT
    USING (auth.uid() = user_id);
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_metrics_user_id ON public.ai_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_metrics_created ON public.ai_metrics(created_at DESC);
