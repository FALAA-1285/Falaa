export interface Project {
  id: string;
  title: string;
  category: "Web & Fullstack" | "Mobile" | "Machine Learning & Tools";
  tagline: string;
  description: string;
  image: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  features: string[];
  metrics?: string;
}

export interface ExperienceItem {
  period: string;
  role: string;
  organization: string;
  location: string;
  type: string;
  description: string;
  highlights: string[];
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
