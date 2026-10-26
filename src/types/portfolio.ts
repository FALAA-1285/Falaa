export interface Project {
  id: string;
  title: string;
  category: "Web & Fullstack" | "Mobile" | "Machine Learning & Tools" | string;
  tagline: string;
  description: string;
  image: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  features: string[];
  metrics?: string;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ExperienceItem {
  id?: number;
  period: string;
  role: string;
  organization: string;
  location: string;
  type: string;
  description: string;
  highlights: string[];
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PersonalInfo {
  name: string;
  handle: string;
  title: string;
  institution: string;
  location: string;
  email: string;
  linkedin: string;
  github: string;
  quote: string;
  about: string;
  aboutSub: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
