-- Create leads table for Spark Mastery landing page
-- Made idempotent (safe to re-run)

CREATE TABLE IF NOT EXISTS public.spark_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  lead_source TEXT DEFAULT 'hero_form',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.spark_leads ENABLE ROW LEVEL SECURITY;

-- Idempotent policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can submit leads" ON public.spark_leads;
  CREATE POLICY "Anyone can submit leads"
    ON public.spark_leads
    FOR INSERT
    WITH CHECK (true);

  DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.spark_leads;
  CREATE POLICY "Authenticated users can view leads"
    ON public.spark_leads
    FOR SELECT
    USING (auth.role() = 'authenticated');
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_spark_leads_email ON public.spark_leads(email);
CREATE INDEX IF NOT EXISTS idx_spark_leads_created_at ON public.spark_leads(created_at DESC);

-- Create the updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Idempotent trigger
DROP TRIGGER IF EXISTS update_spark_leads_updated_at ON public.spark_leads;
CREATE TRIGGER update_spark_leads_updated_at
  BEFORE UPDATE ON public.spark_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();