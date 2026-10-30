-- Migration: 008_add_inlet_lab_project
-- Description: Add InLET research lab website project to projects table

INSERT INTO public.projects (id, title, category, tagline, description, image, tags, github_url, live_url, features, metrics, order_index)
VALUES (
  'inlet-lab',
  'InLET - Information & Learning Engineering Technology Lab Website',
  'Web & Fullstack',
  'Research Lab Portal with Integrated Lab Services',
  'A web portal for the Information and Learning Engineering Technology (InLET) research lab at Politeknik Negeri Malang, built as a PBL project. It showcases the lab''s research pillars, products, partners, team members, news, and gallery, and integrates day-to-day lab services such as tool loans, attendance, and a digital guestbook, all managed through an admin panel.',
  '/projects/inlet-lab.svg',
  '["PHP","JavaScript","Web Development","Admin Panel","Vercel"]'::jsonb,
  '',
  'https://pblinlet.vercel.app/',
  '["Research showcase covering 4 pillars: Information Engineering, Learning Engineering, Information Technology, and Learning Technology","Product catalog for lab research outputs such as VIAT Map, PseudoLearn, and Codeasy","Integrated lab services: tool loan, attendance, and digital guestbook","Admin panel for managing members, news, products, partners, and gallery content"]'::jsonb,
  '4 research pillars, 5 showcased products, and 3 integrated lab services',
  5
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  github_url = EXCLUDED.github_url,
  live_url = EXCLUDED.live_url,
  features = EXCLUDED.features,
  metrics = EXCLUDED.metrics,
  order_index = EXCLUDED.order_index;
