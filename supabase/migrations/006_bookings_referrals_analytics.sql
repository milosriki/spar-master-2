-- ============================================================
-- Migration 006: Bookings, Referrals, Analytics Events tables
-- ============================================================

-- 1. Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'consultation',
  notes TEXT,
  source TEXT DEFAULT 'spark_mastery',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- RLS for bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anon can insert bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (user_id IS NULL);

-- 2. Referral codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  referral_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON public.referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);

-- RLS for referral_codes
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral codes"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referral codes"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own referral codes"
  ON public.referral_codes FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow anyone to read referral codes (for lookup when capturing referrals)
CREATE POLICY "Anyone can look up referral codes"
  ON public.referral_codes FOR SELECT
  USING (true);

-- 3. analytics_events table already exists in generated schema
-- AnalyticsService now writes to analytics_events.event_name instead of ai_metrics.model
