-- Migration: Add missing columns to spark_leads for leadService.ts compatibility
-- The original migration only created: name, email, phone, lead_source, created_at, updated_at
-- The leadService.ts also inserts: fitness_goal, lead_score, status, age_range

ALTER TABLE public.spark_leads ADD COLUMN IF NOT EXISTS fitness_goal TEXT;
ALTER TABLE public.spark_leads ADD COLUMN IF NOT EXISTS lead_score INT DEFAULT 0;
ALTER TABLE public.spark_leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';
ALTER TABLE public.spark_leads ADD COLUMN IF NOT EXISTS age_range TEXT;
