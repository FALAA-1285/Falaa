-- ==============================================================================
-- FALAH PORTFOLIO - SUPABASE POSTGRESQL MIGRATION & SEED SCRIPT
-- ==============================================================================
-- Cara pakai di Supabase:
-- 1. Buka dashboard project Supabase Anda (https://supabase.com/dashboard)
-- 2. Pilih menu "SQL Editor" di bilah kiri
-- 3. Klik "New query", tempel (paste) seluruh isi file ini, lalu klik "Run"
-- ==============================================================================

-- 1. PROFILE INFO TABLE
CREATE TABLE IF NOT EXISTS public.profile_info (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
  name VARCHAR(255) NOT NULL,
  handle VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  institution VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  linkedin TEXT NOT NULL,
  github TEXT NOT NULL,
  quote TEXT NOT NULL,
  about TEXT NOT NULL,
  about_sub TEXT NOT NULL,
  about_headline TEXT DEFAULT 'Hey! I''m FALAH, a Web Developer & IT Student based in Malang, Indonesia.',
  about_tags JSONB DEFAULT '["Web Development", "Mobile App Development", "API Development", "UI/UX Design"]'::jsonb,
  cta_headline TEXT DEFAULT 'Let''s Connect and Collaborate!',
  cta_sub TEXT DEFAULT 'Open for internship opportunities, freelance projects, or just chatting about Web Development, Fullstack Systems, and UI/UX Design.',
  cta_button_text TEXT DEFAULT 'Let''s Talk',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  github_url TEXT NOT NULL DEFAULT '',
  live_url TEXT NOT NULL DEFAULT '',
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  metrics TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. EXPERIENCES TABLE
CREATE TABLE IF NOT EXISTS public.experiences (
  id SERIAL PRIMARY KEY,
  period VARCHAR(100) NOT NULL,
  role VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. SKILLS TABLE
CREATE TABLE IF NOT EXISTS public.skills (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(100) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) DEFAULT '',
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- INITIAL DATA SEEDING
-- ==============================================================================

-- Seed Profile Info
INSERT INTO public.profile_info (id, name, handle, title, institution, location, email, linkedin, github, quote, about, about_sub, about_headline, about_tags, cta_headline, cta_sub, cta_button_text)
VALUES (
  'default',
  'FALAH',
  'FALAA-1285',
  'Web Developer & IT Student',
  'Politeknik Negeri Malang (Polinema)',
  'Malang, Indonesia',
  'ahmadfalahi1285@gmail.com',
  'https://www.linkedin.com/in/ahmad-falahi-8507a4313/',
  'https://github.com/FALAA-1285',
  'First make it work, then make it clean, and finally make it fast.',
  'I am an Information Technology Undergraduate at Politeknik Negeri Malang, passionate about building clean, responsive, and user-friendly websites. I enjoy turning complex ideas into clear, functional, and engaging web applications with a focus on simplicity, performance, and impact.',
  'Specializing in Web Development while actively exploring Flutter & Dart for cross-platform mobile apps, Django for backend architectures, and Machine Learning & Computer Vision for smart automation.',
  'Hey! I''m Falah a software engineer & IT Student based in Malang, Indonesia.',
  '["Web Development","Mobile App Development","UI/UX Design"]'::jsonb,
  'Let''s Connect and Collaborate!',
  'Open for internship opportunities, freelance projects, or just chatting about Web Development, Fullstack Systems, and UI/UX Design.',
  'Let''s Talk'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  handle = EXCLUDED.handle,
  title = EXCLUDED.title,
  institution = EXCLUDED.institution,
  location = EXCLUDED.location,
  email = EXCLUDED.email,
  linkedin = EXCLUDED.linkedin,
  github = EXCLUDED.github,
  quote = EXCLUDED.quote,
  about = EXCLUDED.about,
  about_sub = EXCLUDED.about_sub,
  about_headline = EXCLUDED.about_headline,
  about_tags = EXCLUDED.about_tags,
  cta_headline = EXCLUDED.cta_headline,
  cta_sub = EXCLUDED.cta_sub,
  cta_button_text = EXCLUDED.cta_button_text;

-- Seed Projects (6 items)
INSERT INTO public.projects (id, title, category, tagline, description, image, tags, github_url, live_url, features, metrics, order_index)
VALUES (
  'academic-portal',
  'Polinema Academic & Student Portal',
  'Web & Fullstack',
  'Comprehensive Academic Management System',
  'A modern, responsive academic web application built for students and faculty members at Politeknik Negeri Malang. It streamlines course enrollment (KRS), academic transcript tracking (KHS), real-time GPA calculations, and class scheduling with multi-role access control.',
  '/projects/project-1.svg',
  '["Laravel","PHP","Tailwind CSS","MySQL","Alpine.js"]'::jsonb,
  'https://github.com/FALAA-1285',
  'https://github.com/FALAA-1285',
  '["Role-Based Access Control (RBAC) for Students, Lecturers, and Admins","Dynamic GPA and SKS tracking with automated transcript generation","Interactive course schedule calendar with conflict detection","Fast database querying with optimized indexing in MySQL"]'::jsonb,
  'Reduced course registration processing time by 40%',
  0
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

INSERT INTO public.projects (id, title, category, tagline, description, image, tags, github_url, live_url, features, metrics, order_index)
VALUES (
  'lumina-store',
  'Lumina Modern E-Commerce Platform',
  'Web & Fullstack',
  'High-Performance Digital Storefront & Checkout',
  'A fast, modern fullstack e-commerce web application featuring real-time product filtering, seamless slide-out cart management, Supabase database authentication, and a responsive order dashboard with crisp dark/light styling.',
  '/projects/project-2.svg',
  '["Next.js","TypeScript","React","Tailwind CSS","Supabase"]'::jsonb,
  'https://github.com/FALAA-1285',
  'https://github.com/FALAA-1285',
  '["Server-side rendering (SSR) and static generation for fast loading","Persistent shopping cart state with local and cloud sync","Instant fuzzy search and multi-category filtering","Secure authentication and user profile management via Supabase"]'::jsonb,
  'Achieved 98+ Google Lighthouse Performance Score',
  1
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

INSERT INTO public.projects (id, title, category, tagline, description, image, tags, github_url, live_url, features, metrics, order_index)
VALUES (
  'cv-detector',
  'Computer Vision & Object Recognition',
  'Machine Learning & Tools',
  'Real-Time Object Detection & Classification Engine',
  'An intelligent computer vision application built during academic research and independent exploration. Utilizes OpenCV and deep learning models (TensorFlow/PyTorch) to perform real-time video stream processing, multi-object bounding box tracking, and confidence scoring.',
  '/projects/project-3.svg',
  '["Python","OpenCV","TensorFlow","PyTorch","NumPy"]'::jsonb,
  'https://github.com/FALAA-1285',
  'https://github.com/FALAA-1285',
  '["Real-time video inference at 60 FPS using hardware acceleration","Accurate multi-class detection with custom trained neural weights","Live analytics HUD displaying inference latency and detected labels","Clean modular Python codebase easily adaptable for surveillance or robotics"]'::jsonb,
  'Average inference latency under 15ms per frame',
  2
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

INSERT INTO public.projects (id, title, category, tagline, description, image, tags, github_url, live_url, features, metrics, order_index)
VALUES (
  'campus-events',
  'Polinema DevSummit & Event Ticketing',
  'Web & Fullstack',
  'Campus Event Discovery & QR Validation Platform',
  'A full-featured event management and digital ticketing web platform for university conferences, workshops, and tech seminars. Allows students to discover campus events, reserve seats, and receive downloadable digital tickets with encrypted QR codes.',
  '/projects/project-4.svg',
  '["Laravel","JavaScript","Tailwind CSS","MySQL","QR Service"]'::jsonb,
  'https://github.com/FALAA-1285',
  'https://github.com/FALAA-1285',
  '["Dynamic event schedule, speaker bio cards, and venue maps","Automated PDF ticket stub generation with scannable QR tokens","Admin check-in dashboard with real-time attendee scan statistics","Responsive layout optimized for mobile check-in scanners"]'::jsonb,
  'Handled 1,200+ simulated attendees with zero bottlenecks',
  3
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

INSERT INTO public.projects (id, title, category, tagline, description, image, tags, github_url, live_url, features, metrics, order_index)
VALUES (
  'habitflow-mobile',
  'HabitFlow Cross-Platform Mobile Tracker',
  'Mobile',
  'Developer Productivity & Habit Streak App',
  'A cross-platform mobile application built with Flutter and Dart tailored for developers and students. Features customizable daily habits, streak tracking, visual progression analytics, and offline-first storage with background notifications.',
  '/projects/project-5.svg',
  '["Flutter","Dart","Firebase","Local Storage","Material 3"]'::jsonb,
  'https://github.com/FALAA-1285',
  'https://github.com/FALAA-1285',
  '["Smooth 60 FPS animations and gestures powered by Flutter engine","Offline-first architecture with automatic sync when connected","Streak heatmaps and weekly completion percentage graphs","Configurable reminder notifications for daily coding sessions"]'::jsonb,
  'Single codebase running seamlessly on Android & iOS',
  4
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

INSERT INTO public.projects (id, title, category, tagline, description, image, tags, github_url, live_url, features, metrics, order_index)
VALUES (
  'core-gateway',
  'High-Throughput Microservice & API Gateway',
  'Web & Fullstack',
  'Centralized Authentication & Routing Engine',
  'A high-performance RESTful API gateway designed to unify distributed web services. Implements JWT token authentication, route rate-limiting, centralized error logging, and PostgreSQL connection pooling for secure enterprise backend communication.',
  '/projects/project-6.svg',
  '["Django","Python","Node.js","PostgreSQL","REST API"]'::jsonb,
  'https://github.com/FALAA-1285',
  'https://github.com/FALAA-1285',
  '["JWT-based stateless authentication with token refresh rotation","IP and API key-based rate limiting to protect backend servers","Automated OpenAPI / Swagger interactive documentation","Comprehensive unit and integration test coverage"]'::jsonb,
  'Capable of handling 5,000+ requests per second',
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

-- Seed Experiences (3 items)
INSERT INTO public.experiences (id, period, role, organization, location, type, description, highlights, order_index)
VALUES (
  1,
  'Jan 2025 - Des 2025',
  'Organizing Committee Bidang 3',
  'UKM Pendidikan dan Penalaran',
  'Politeknik Negeri Malang',
  'Organization',
  'Memegang peran strategis dalam pengelolaan operasional, manajemen peserta, dan pemenuhan seluruh kebutuhan logistik organisasi untuk berbagai agenda dan seminar teknologi skala universitas.',
  '["Memimpin dan mengelola penyediaan seluruh kebutuhan logistik sebagai Koordinator Perlengkapan untuk acara perayaan HUT ke-25 UKM Pendidikan dan Penalaran serta Techno Fair & Seminar 2025.","Bertanggung jawab penuh dalam koordinasi lintas divisi, manajemen alur peserta, tata kelola fasilitas teknis, dan kelancaran event organizing."]'::jsonb,
  0
)
ON CONFLICT (id) DO UPDATE SET
  period = EXCLUDED.period,
  role = EXCLUDED.role,
  organization = EXCLUDED.organization,
  location = EXCLUDED.location,
  type = EXCLUDED.type,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  order_index = EXCLUDED.order_index;

INSERT INTO public.experiences (id, period, role, organization, location, type, description, highlights, order_index)
VALUES (
  3,
  'Mar 2026 - Jul 2026',
  'Koordinator Perlengkapan',
  'Play It JTI Polinema',
  'Jurusan Teknologi Informasi, Polinema',
  'Committee',
  'Memimpin divisi perlengkapan dalam merancang kesiapan infrastruktur teknis, sarana perangkat keras, dan tata kelola arena kompetisi tahunan di lingkungan Jurusan Teknologi Informasi.',
  '["Bertanggung jawab penuh dalam memimpin dan mengelola alokasi kebutuhan logistik, perlengkapan teknis, serta kelancaran operasional selama seluruh rangkaian kompetisi PlayIt Polinema."]'::jsonb,
  1
)
ON CONFLICT (id) DO UPDATE SET
  period = EXCLUDED.period,
  role = EXCLUDED.role,
  organization = EXCLUDED.organization,
  location = EXCLUDED.location,
  type = EXCLUDED.type,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  order_index = EXCLUDED.order_index;

INSERT INTO public.experiences (id, period, role, organization, location, type, description, highlights, order_index)
VALUES (
  2,
  'Jan 2026 - Sekarang',
  'Staff Divisi Catalyst & Technology',
  'Young On Top (YOT) Malang',
  'Malang, Indonesia',
  'Organization',
  'Mendorong implementasi teknologi dan inisiatif produktivitas kepemudaan, sekaligus mengorkestrasi eksekusi program kerja sosial dan edukasi berskala regional.',
  '["Menjadi Person in Charge (PIC) program kerja ''AI & Productivity Tools Workshop'', mengoordinasikan perencanaan kurikulum, teknis pelaksanaan, dan kolaborasi antaranggota untuk memastikan kegiatan berjalan efektif dan berdampak luas.","Mengoordinasikan bidang Logistik dan Konsumsi pada program ''YOT Share Ramadan 2026'', mencakup pengelolaan inventaris, alur pengadaan, dan distribusi kebutuhan untuk menunjang kelancaran kegiatan."]'::jsonb,
  2
)
ON CONFLICT (id) DO UPDATE SET
  period = EXCLUDED.period,
  role = EXCLUDED.role,
  organization = EXCLUDED.organization,
  location = EXCLUDED.location,
  type = EXCLUDED.type,
  description = EXCLUDED.description,
  highlights = EXCLUDED.highlights,
  order_index = EXCLUDED.order_index;

SELECT setval('experiences_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.experiences));

-- Seed Skills (26 items)
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  1,
  'Programming Languages',
  'JavaScript',
  'javascript.svg',
  0
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  2,
  'Programming Languages',
  'TypeScript',
  'typescript.svg',
  1
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  3,
  'Programming Languages',
  'PHP',
  'php.svg',
  2
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  4,
  'Programming Languages',
  'Python',
  'python.svg',
  3
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  5,
  'Programming Languages',
  'Java',
  'java.svg',
  4
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  6,
  'Programming Languages',
  'Dart',
  'dart.svg',
  5
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  7,
  'Frontend',
  'HTML5',
  'html5.svg',
  6
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  8,
  'Frontend',
  'CSS3',
  'css3.svg',
  7
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  9,
  'Frontend',
  'React',
  'react.svg',
  8
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  10,
  'Frontend',
  'Next.js',
  'nextjs.svg',
  9
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  11,
  'Frontend',
  'Tailwind CSS',
  'tailwindcss.svg',
  10
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  12,
  'Frontend',
  'Flutter',
  'flutter.svg',
  11
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  13,
  'Backend',
  'Laravel',
  'laravel.svg',
  12
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  14,
  'Backend',
  'Django',
  'django.svg',
  13
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  15,
  'Backend',
  'Node.js',
  'nodejs.svg',
  14
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  16,
  'Databases',
  'PostgreSQL',
  'postgresql.svg',
  15
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  17,
  'Databases',
  'MySQL',
  'mysql.svg',
  16
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  18,
  'Databases',
  'Supabase',
  'supabase.svg',
  17
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  19,
  'Tools & Machine Learning',
  'Git',
  'git.svg',
  18
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  20,
  'Tools & Machine Learning',
  'GitHub',
  'github.svg',
  19
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  21,
  'Tools & Machine Learning',
  'Figma',
  'figma.svg',
  20
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  22,
  'Tools & Machine Learning',
  'VS Code',
  'vscode.svg',
  21
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  23,
  'Tools & Machine Learning',
  'OpenCV',
  'opencv.svg',
  22
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  24,
  'Tools & Machine Learning',
  'TensorFlow',
  'tensorflow.svg',
  23
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  25,
  'Tools & Machine Learning',
  'PyTorch',
  'pytorch.svg',
  24
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;
INSERT INTO public.skills (id, category, name, icon, order_index)
VALUES (
  26,
  'Tools & Machine Learning',
  'Scikit-Learn',
  'scikitlearn.svg',
  25
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;

SELECT setval('skills_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.skills));

