-- Migration: 004_enable_row_level_security
-- Description: Enable Row Level Security (RLS) on public tables with secure public read & contact write policies

-- 1. Enable RLS on all tables
ALTER TABLE public.profile_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any to allow safe re-run
DROP POLICY IF EXISTS "Public can view profile info" ON public.profile_info;
DROP POLICY IF EXISTS "Public can view projects" ON public.projects;
DROP POLICY IF EXISTS "Public can view experiences" ON public.experiences;
DROP POLICY IF EXISTS "Public can view skills" ON public.skills;
DROP POLICY IF EXISTS "Public can submit contact messages" ON public.messages;

-- 3. Create public read policies for portfolio display
CREATE POLICY "Public can view profile info" 
  ON public.profile_info FOR SELECT 
  USING (true);

CREATE POLICY "Public can view projects" 
  ON public.projects FOR SELECT 
  USING (true);

CREATE POLICY "Public can view experiences" 
  ON public.experiences FOR SELECT 
  USING (true);

CREATE POLICY "Public can view skills" 
  ON public.skills FOR SELECT 
  USING (true);

-- 4. Create public insert policy for contact inquiries
CREATE POLICY "Public can submit contact messages" 
  ON public.messages FOR INSERT 
  WITH CHECK (true);
