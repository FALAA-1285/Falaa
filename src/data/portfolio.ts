import { PersonalInfo, Project, ExperienceItem } from "@/types/portfolio";

export const PERSONAL_INFO: PersonalInfo = {
  name: "Ahmad Falahi",
  handle: "FALAA-1285",
  title: "Web Developer & IT Student",
  institution: "Politeknik Negeri Malang (Polinema)",
  location: "Malang, Indonesia",
  email: "ahmadfalahi1285@gmail.com",
  linkedin: "https://www.linkedin.com/in/ahmad-falahi-8507a4313/",
  github: "https://github.com/FALAA-1285",
  quote: "First make it work, then make it clean, and finally make it fast.",
  about: `I am an Information Technology Undergraduate at Politeknik Negeri Malang, passionate about building clean, responsive, and user-friendly websites. I enjoy turning complex ideas into clear, functional, and engaging web applications with a focus on simplicity, performance, and impact.`,
  aboutSub: `Specializing in Web Development while actively exploring Flutter & Dart for cross-platform mobile apps, Django for backend architectures, and Machine Learning & Computer Vision for smart automation.`,
};

export const PROJECTS_DATA: Project[] = [
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
  },
];

export const EXPERIENCE_DATA: ExperienceItem[] = [
  {
    period: "2023 - Present",
    role: "Information Technology Undergraduate",
    organization: "Politeknik Negeri Malang (Polinema)",
    location: "Malang, East Java, Indonesia",
    type: "Academic Degree",
    description:
      "Pursuing a degree in Information Technology with a strong focus on software engineering, web application development, database design, and algorithmic problem-solving. Collaborated on numerous software lab projects and group systems.",
    highlights: [
      "Specializing in Web Development architectures (MVC, REST, Single Page Apps)",
      "Maintained high academic standing with comprehensive practical coursework",
      "Active participant in campus tech workshops, coding bootcamps, and developer circles",
    ],
  },
  {
    period: "2024 - Present",
    role: "Web Developer & Freelance Consultant",
    organization: "Self-Employed & Collaborative Projects",
    location: "Malang, Indonesia",
    type: "Freelance & Projects",
    description:
      "Designing and engineering bespoke web applications and interactive landing pages for student organizations, small businesses, and academic initiatives. Emphasizing clean UI/UX, responsive mobile design, and fast database transactions.",
    highlights: [
      "Built production-ready web apps using Laravel, Next.js, and Tailwind CSS",
      "Integrated secure authentication, relational databases (MySQL, PostgreSQL), and REST APIs",
      "Delivered clean, maintainable, well-documented code adhering to industry standards",
    ],
  },
  {
    period: "2024 - Present",
    role: "Mobile App & AI/ML Independent Researcher",
    organization: "Continuous Exploration & Self-Study",
    location: "Malang, Indonesia",
    type: "Research & Development",
    description:
      "Actively expanding technical horizons into mobile development using Flutter & Dart, and artificial intelligence incorporating Computer Vision with OpenCV, TensorFlow, and PyTorch.",
    highlights: [
      "Created cross-platform prototypes with Flutter focusing on intuitive user experience",
      "Trained and evaluated deep learning models for object recognition and image classification",
      "Exploring scalable Django REST API architectures for ML model serving",
    ],
  },
];
