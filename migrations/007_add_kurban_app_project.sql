-- Migration: 007_add_kurban_app_project
-- Description: Add KurbanApp Figma UI/UX project to projects table

INSERT INTO public.projects (id, title, category, tagline, description, image, tags, github_url, live_url, features, metrics, order_index)
VALUES (
  'kurban-app',
  'KurbanApp - Mobile Qurban & Distribution Platform',
  'UI/UX Desain',
  'Interactive Mobile UI/UX Prototype for Digital Qurban & Distribution',
  'An end-to-end mobile application UI/UX design and interactive prototype created in Figma. KurbanApp streamlines Islamic sacrificial animal (Qurban) ordering, joint-share pooling (1/7 cow portion), real-time logistics tracking, and verified transparent distribution reports for donors during Eid al-Adha.',
  '/projects/kurban-app-cover.webp',
  '["Figma","UI/UX Design","Mobile App","Prototyping","Design System"]'::jsonb,
  '',
  'https://www.figma.com/proto/GQakrFddjVu5ITv7hbJOxk/KurbanApp?node-id=64-2&t=ZoAmdsx4RgdGaux2-1&scaling=scale-down&content-scaling=fixed&page-id=3%3A32&starting-point-node-id=64%3A2',
  '["End-to-end interactive mobile flow: livestock catalog, joint-share pooling, and checkout","Comprehensive animal health specs, weight metrics, and certified breeder origin verification","Transparent distribution tracking with automated photo/video slaughter documentation","High-fidelity design system with responsive layouts, accessible typography, and smooth micro-interactions"]'::jsonb,
  'Interactive prototype with 20+ responsive screens and seamless user flows',
  6
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
