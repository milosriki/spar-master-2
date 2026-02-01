-- Create leads table for Spark Mastery landing page
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

-- Allow anyone to insert leads (public form)
CREATE POLICY "Anyone can submit leads"
  ON public.spark_leads
  FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can view leads
CREATE POLICY "Authenticated users can view leads"
  ON public.spark_leads
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Create index for faster email lookups
CREATE INDEX idx_spark_leads_email ON public.spark_leads(email);
CREATE INDEX idx_spark_leads_created_at ON public.spark_leads(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_spark_leads_updated_at
  BEFORE UPDATE ON public.spark_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();