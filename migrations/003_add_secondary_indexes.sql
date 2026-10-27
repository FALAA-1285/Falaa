-- Migration: 003_add_secondary_indexes
-- Description: Add secondary indexes for sorting by order_index, created_at, and filtering categories

-- Projects ordering index
CREATE INDEX IF NOT EXISTS idx_projects_order 
  ON public.projects(order_index ASC);

-- Experiences ordering index
CREATE INDEX IF NOT EXISTS idx_experiences_order 
  ON public.experiences(order_index ASC);

-- Skills ordering index
CREATE INDEX IF NOT EXISTS idx_skills_order 
  ON public.skills(order_index ASC);

-- Skills category filtering index
CREATE INDEX IF NOT EXISTS idx_skills_category 
  ON public.skills(category);

-- Messages chronological ordering index
CREATE INDEX IF NOT EXISTS idx_messages_created 
  ON public.messages(created_at DESC);

-- Partial index for fast lookup of unread inquiries
CREATE INDEX IF NOT EXISTS idx_messages_unread 
  ON public.messages(is_read) 
  WHERE is_read = FALSE;
