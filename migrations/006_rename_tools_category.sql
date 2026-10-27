-- Migration: 006_rename_tools_category
-- Description: Rename category from 'Tools & Machine Learning' to 'Tools & Others'

UPDATE public.skills 
SET category = 'Tools & Others' 
WHERE category = 'Tools & Machine Learning' OR category ILIKE '%tools%machine learning%';
