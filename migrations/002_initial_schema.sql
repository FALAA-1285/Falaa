-- Migration: 002_initial_schema
-- Description: Core tables for FALAH Portfolio CMS (idempotent, preserves existing data)

-- 1. Profile Info Table
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

-- 2. Projects Table
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

-- 3. Experiences Table
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

-- 4. Skills Table
CREATE TABLE IF NOT EXISTS public.skills (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(100) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) DEFAULT '',
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
