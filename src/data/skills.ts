import { SkillCategoryGroup } from "@/types/skills";

export const MONOCHROME_SKILL_CATEGORIES: SkillCategoryGroup[] = [
  {
    category: "Programming Languages",
    skills: [
      { name: "JavaScript", icon: "javascript.svg" },
      { name: "TypeScript", icon: "typescript.svg" },
      { name: "PHP", icon: "php.svg" },
      { name: "Python", icon: "python.svg" },
      { name: "Java", icon: "java.svg" },
      { name: "Dart", icon: "dart.svg" },
    ],
  },
  {
    category: "Frontend",
    skills: [
      { name: "HTML5", icon: "html5.svg" },
      { name: "CSS3", icon: "css3.svg" },
      { name: "React", icon: "react.svg" },
      { name: "Next.js", icon: "nextjs.svg" },
      { name: "Tailwind CSS", icon: "tailwindcss.svg" },
      { name: "Flutter", icon: "flutter.svg" },
    ],
  },
  {
    category: "Backend",
    skills: [
      { name: "Laravel", icon: "laravel.svg" },
      { name: "Django", icon: "django.svg" },
      { name: "Node.js", icon: "nodejs.svg" },
    ],
  },
  {
    category: "Databases",
    skills: [
      { name: "PostgreSQL", icon: "postgresql.svg" },
      { name: "MySQL", icon: "mysql.svg" },
      { name: "Supabase", icon: "supabase.svg" },
    ],
  },
  {
    category: "Tools & Machine Learning",
    skills: [
      { name: "Git", icon: "git.svg" },
      { name: "GitHub", icon: "github.svg" },
      { name: "Figma", icon: "figma.svg" },
      { name: "VS Code", icon: "vscode.svg" },
      { name: "OpenCV", icon: "opencv.svg" },
      { name: "TensorFlow", icon: "tensorflow.svg" },
      { name: "PyTorch", icon: "pytorch.svg" },
      { name: "Scikit-Learn", icon: "scikitlearn.svg" },
    ],
  },
];
