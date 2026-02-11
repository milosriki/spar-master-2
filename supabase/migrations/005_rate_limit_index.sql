-- =============================================
-- Migration 005: Rate Limit Index + Security Hardening
-- Optimizes the server-side rate limit query on ai_metrics
-- Made idempotent (safe to re-run)
-- =============================================

-- 1. Composite index for rate limit query: COUNT(*) WHERE user_id = ? AND created_at >= today
-- Without this, the rate limit check would do a full table scan on every chat message
CREATE INDEX IF NOT EXISTS idx_ai_metrics_user_date
  ON public.ai_metrics(user_id, created_at DESC);

-- 2. Ensure service_role can insert ai_metrics (needed for rate limit counting)
-- This policy already exists in 004, but ensure it covers INSERT specifically
DO $$ BEGIN
  DROP POLICY IF EXISTS "Service role insert on ai_metrics" ON public.ai_metrics;
  CREATE POLICY "Service role insert on ai_metrics"
    ON public.ai_metrics FOR INSERT
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;
