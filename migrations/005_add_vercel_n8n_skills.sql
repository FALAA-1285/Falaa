-- Migration: 005_add_vercel_n8n_skills
-- Description: Add Vercel and n8n tools to public.skills

INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES 
  (27, 'Tools & Others', 'Vercel', 'vercel.svg', 26),
  (28, 'Tools & Others', 'n8n', 'n8n.svg', 27)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;

SELECT setval('skills_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.skills));
