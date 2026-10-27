import type { PersonalInfo, Project, ExperienceItem } from "@/types/portfolio";
import type { SkillItem } from "@/types/skills";

export const DEFAULT_PERSONAL_INFO: PersonalInfo = {
  name: "FALAH",
  handle: "falaa",
  title: "Web Developer & IT Student",
  institution: "Politeknik Negeri Malang (Polinema)",
  location: "Malang, Indonesia",
  email: "m.falah1285@gmail.com",
  linkedin: "https://www.linkedin.com/in/muhammad-falah-nur-hidayat-67994931a/",
  github: "https://github.com/FALAA-1285",
  quote: "Transforming complex engineering concepts into fast, aesthetic digital experiences.",
  about:
    "I'm a Web Developer and Information Technology student at Politeknik Negeri Malang. Passionate about software engineering, scalable backend architectures, and crafting intuitive, responsive web applications.",
  aboutSub:
    "My journey spans full-stack web applications with Next.js & Laravel, mobile application prototyping with Flutter, and applied AI exploration using Computer Vision and Machine Learning.",
  aboutHeadline:
    "Hey! I'm FALAH, a Web Developer & IT Student based in Malang, Indonesia.",
  aboutTags: [
    "Web Development",
    "Mobile App Development",
    "API Development",
    "UI/UX Design",
  ],
  ctaHeadline: "Let's Connect and Collaborate!",
  ctaSub:
    "Open for internship opportunities, freelance projects, or just chatting about Web Development, Fullstack Systems, and UI/UX Design.",
  ctaButtonText: "Let's Talk",
};

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: "academic-portal",
    title: "Polinema Academic & Student Portal",
    category: "Web & Fullstack",
    tagline: "Comprehensive Academic Management System",
    description:
      "A modern, responsive academic web application built for students and faculty members at Politeknik Negeri Malang. It streamlines course enrollment (KRS), academic transcript tracking (KHS), real-time GPA calculations, and class scheduling with multi-role access control.",
    image: "/projects/project-1.svg",
    tags: ["Laravel", "PHP", "Tailwind CSS", "MySQL", "Alpine.js"],
    githubUrl: "https://github.com/FALAA-1285",
    liveUrl: "https://github.com/FALAA-1285",
    features: [
      "Role-Based Access Control (RBAC) for Students, Lecturers, and Admins",
      "Dynamic GPA and SKS tracking with automated transcript generation",
      "Interactive course schedule calendar with conflict detection",
      "Fast database querying with optimized indexing in MySQL",
    ],
    metrics: "Reduced course registration processing time by 40%",
    order_index: 0,
  },
  {
    id: "lumina-store",
    title: "Lumina Modern E-Commerce Platform",
    category: "Web & Fullstack",
    tagline: "High-Performance Digital Storefront & Checkout",
    description:
      "A fast, modern fullstack e-commerce web application featuring real-time product filtering, seamless slide-out cart management, Supabase database authentication, and a responsive order dashboard with crisp dark/light styling.",
    image: "/projects/project-2.svg",
    tags: ["Next.js", "TypeScript", "React", "Tailwind CSS", "Supabase"],
    githubUrl: "https://github.com/FALAA-1285",
    liveUrl: "https://github.com/FALAA-1285",
    features: [
      "Server-side rendering (SSR) and static generation for fast loading",
      "Persistent shopping cart state with local and cloud sync",
      "Instant fuzzy search and multi-category filtering",
      "Secure authentication and user profile management via Supabase",
    ],
    metrics: "Achieved 98+ Google Lighthouse Performance Score",
    order_index: 1,
  },
  {
    id: "cv-detector",
    title: "Computer Vision & Object Recognition",
    category: "Machine Learning & Tools",
    tagline: "Real-Time Object Detection & Classification Engine",
    description:
      "An intelligent computer vision application built during academic research and independent exploration. Utilizes OpenCV and deep learning models (TensorFlow/PyTorch) to perform real-time video stream processing, multi-object bounding box tracking, and confidence scoring.",
    image: "/projects/project-3.svg",
    tags: ["Python", "OpenCV", "TensorFlow", "PyTorch", "NumPy"],
    githubUrl: "https://github.com/FALAA-1285",
    liveUrl: "https://github.com/FALAA-1285",
    features: [
      "Real-time video inference at 60 FPS using hardware acceleration",
      "Accurate multi-class detection with custom trained neural weights",
      "Live analytics HUD displaying inference latency and detected labels",
      "Clean modular Python codebase easily adaptable for surveillance or robotics",
    ],
    metrics: "Average inference latency under 15ms per frame",
    order_index: 2,
  },
  {
    id: "campus-events",
    title: "Polinema DevSummit & Event Ticketing",
    category: "Web & Fullstack",
    tagline: "Campus Event Discovery & QR Validation Platform",
    description:
      "A full-featured event management and digital ticketing web platform for university conferences, workshops, and tech seminars. Allows students to discover campus events, reserve seats, and receive downloadable digital tickets with encrypted QR codes.",
    image: "/projects/project-4.svg",
    tags: ["Laravel", "JavaScript", "Tailwind CSS", "MySQL", "QR Service"],
    githubUrl: "https://github.com/FALAA-1285",
    liveUrl: "https://github.com/FALAA-1285",
    features: [
      "Dynamic event schedule, speaker bio cards, and venue maps",
      "Automated PDF ticket stub generation with scannable QR tokens",
      "Admin check-in dashboard with real-time attendee scan statistics",
      "Responsive layout optimized for mobile check-in scanners",
    ],
    metrics: "Handled 1,200+ simulated attendees with zero bottlenecks",
    order_index: 3,
  },
  {
    id: "habitflow-mobile",
    title: "HabitFlow Cross-Platform Mobile Tracker",
    category: "Mobile",
    tagline: "Developer Productivity & Habit Streak App",
    description:
      "A cross-platform mobile application built with Flutter and Dart tailored for developers and students. Features customizable daily habits, streak tracking, visual progression analytics, and offline-first storage with background notifications.",
    image: "/projects/project-5.svg",
    tags: ["Flutter", "Dart", "Firebase", "Local Storage", "Material 3"],
    githubUrl: "https://github.com/FALAA-1285",
    liveUrl: "https://github.com/FALAA-1285",
    features: [
      "Smooth 60 FPS animations and gestures powered by Flutter engine",
      "Offline-first architecture with automatic sync when connected",
      "Streak heatmaps and weekly completion percentage graphs",
      "Configurable reminder notifications for daily coding sessions",
    ],
    metrics: "Single codebase running seamlessly on Android & iOS",
    order_index: 4,
  },
  {
    id: "core-gateway",
    title: "High-Throughput Microservice & API Gateway",
    category: "Web & Fullstack",
    tagline: "Centralized Authentication & Routing Engine",
    description:
      "A high-performance RESTful API gateway designed to unify distributed web services. Implements JWT token authentication, route rate-limiting, centralized error logging, and PostgreSQL connection pooling for secure enterprise backend communication.",
    image: "/projects/project-6.svg",
    tags: ["Django", "Python", "Node.js", "PostgreSQL", "REST API"],
    githubUrl: "https://github.com/FALAA-1285",
    liveUrl: "https://github.com/FALAA-1285",
    features: [
      "JWT-based stateless authentication with token refresh rotation",
      "IP and API key-based rate limiting to protect backend servers",
      "Automated OpenAPI / Swagger interactive documentation",
      "Comprehensive unit and integration test coverage",
    ],
    metrics: "Capable of handling 5,000+ requests per second",
    order_index: 5,
  },
];

export const DEFAULT_EXPERIENCES: ExperienceItem[] = [
  {
    id: 1,
    period: "Jan 2025 - Des 2025",
    role: "Organizing Committee Bidang 3",
    organization: "UKM Pendidikan dan Penalaran",
    location: "Politeknik Negeri Malang",
    type: "Organization",
    description:
      "Memegang peran strategis dalam pengelolaan operasional, manajemen peserta, dan pemenuhan seluruh kebutuhan logistik organisasi untuk berbagai agenda dan seminar teknologi skala universitas.",
    highlights: [
      "Memimpin dan mengelola penyediaan seluruh kebutuhan logistik sebagai Koordinator Perlengkapan untuk acara perayaan HUT ke-25 UKM Pendidikan dan Penalaran serta Techno Fair & Seminar 2025.",
      "Bertanggung jawab penuh dalam koordinasi lintas divisi, manajemen alur peserta, tata kelola fasilitas teknis, dan kelancaran event organizing.",
    ],
    order_index: 0,
  },
  {
    id: 3,
    period: "Mar 2026 - Jul 2026",
    role: "Koordinator Perlengkapan",
    organization: "Play It JTI Polinema",
    location: "Jurusan Teknologi Informasi, Polinema",
    type: "Committee",
    description:
      "Memimpin divisi perlengkapan dalam merancang kesiapan infrastruktur teknis, sarana perangkat keras, dan tata kelola arena kompetisi tahunan di lingkungan Jurusan Teknologi Informasi.",
    highlights: [
      "Bertanggung jawab penuh dalam memimpin dan mengelola alokasi kebutuhan logistik, perlengkapan teknis, serta kelancaran operasional selama seluruh rangkaian kompetisi PlayIt Polinema.",
    ],
    order_index: 1,
  },
  {
    id: 2,
    period: "Jan 2026 - Sekarang",
    role: "Staff Divisi Catalyst & Technology",
    organization: "Young On Top (YOT) Malang",
    location: "Malang, Indonesia",
    type: "Organization",
    description:
      "Mendorong implementasi teknologi dan inisiatif produktivitas kepemudaan, sekaligus mengorkestrasi eksekusi program kerja sosial dan edukasi berskala regional.",
    highlights: [
      "Menjadi Person in Charge (PIC) program kerja 'AI & Productivity Tools Workshop', mengoordinasikan perencanaan kurikulum, teknis pelaksanaan, dan kolaborasi antaranggota untuk memastikan kegiatan berjalan efektif dan berdampak luas.",
      "Mengoordinasikan bidang Logistik dan Konsumsi pada program 'YOT Share Ramadan 2026', mencakup pengelolaan inventaris, alur pengadaan, dan distribusi kebutuhan untuk menunjang kelancaran kegiatan.",
    ],
    order_index: 2,
  },
];

export const DEFAULT_SKILLS: SkillItem[] = [
  { id: 1, name: "JavaScript", icon: "javascript.svg", category: "Programming Languages", order_index: 0 },
  { id: 2, name: "TypeScript", icon: "typescript.svg", category: "Programming Languages", order_index: 1 },
  { id: 3, name: "PHP", icon: "php.svg", category: "Programming Languages", order_index: 2 },
  { id: 4, name: "Python", icon: "python.svg", category: "Programming Languages", order_index: 3 },
  { id: 5, name: "Java", icon: "java.svg", category: "Programming Languages", order_index: 4 },
  { id: 6, name: "Dart", icon: "dart.svg", category: "Programming Languages", order_index: 5 },
  { id: 7, name: "HTML5", icon: "html5.svg", category: "Frontend", order_index: 0 },
  { id: 8, name: "CSS3", icon: "css3.svg", category: "Frontend", order_index: 1 },
  { id: 9, name: "React", icon: "react.svg", category: "Frontend", order_index: 2 },
  { id: 10, name: "Next.js", icon: "nextjs.svg", category: "Frontend", order_index: 3 },
  { id: 11, name: "Tailwind CSS", icon: "tailwindcss.svg", category: "Frontend", order_index: 4 },
  { id: 12, name: "Flutter", icon: "flutter.svg", category: "Frontend", order_index: 5 },
  { id: 13, name: "Laravel", icon: "laravel.svg", category: "Backend", order_index: 0 },
  { id: 14, name: "Django", icon: "django.svg", category: "Backend", order_index: 1 },
  { id: 15, name: "Node.js", icon: "nodejs.svg", category: "Backend", order_index: 2 },
  { id: 16, name: "PostgreSQL", icon: "postgresql.svg", category: "Databases", order_index: 0 },
  { id: 17, name: "MySQL", icon: "mysql.svg", category: "Databases", order_index: 1 },
  { id: 18, name: "Supabase", icon: "supabase.svg", category: "Databases", order_index: 2 },
  { id: 19, name: "Git", icon: "git.svg", category: "Tools & Others", order_index: 0 },
  { id: 20, name: "GitHub", icon: "github.svg", category: "Tools & Others", order_index: 1 },
  { id: 21, name: "Figma", icon: "figma.svg", category: "Tools & Others", order_index: 2 },
  { id: 22, name: "VS Code", icon: "vscode.svg", category: "Tools & Others", order_index: 3 },
  { id: 23, name: "OpenCV", icon: "opencv.svg", category: "Tools & Others", order_index: 4 },
  { id: 24, name: "TensorFlow", icon: "tensorflow.svg", category: "Tools & Others", order_index: 5 },
  { id: 25, name: "PyTorch", icon: "pytorch.svg", category: "Tools & Others", order_index: 6 },
  { id: 26, name: "Scikit-Learn", icon: "scikitlearn.svg", category: "Tools & Others", order_index: 7 },
  { id: 27, name: "Vercel", icon: "vercel.svg", category: "Tools & Others", order_index: 8 },
  { id: 28, name: "n8n", icon: "n8n.svg", category: "Tools & Others", order_index: 9 },
];
