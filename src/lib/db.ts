import { Pool } from "pg";
import { Project, ExperienceItem, PersonalInfo, ContactMessage } from "@/types/portfolio";
import { SkillCategoryGroup, SkillItem } from "@/types/skills";

// Keep a global singleton pool across Next.js fast refresh
declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

export const pool =
  globalThis.pgPool ||
  new Pool({
    connectionString:
      process.env.DATABASE_URL || "postgresql://postgres@localhost:5432/falaa",
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.pgPool = pool;
}

/**
 * ==========================================
 * PROJECTS CRUD
 * ==========================================
 */

export async function getProjects(): Promise<Project[]> {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, category, tagline, description, image, tags,
              github_url as "githubUrl", live_url as "liveUrl", features, metrics, order_index,
              created_at, updated_at
       FROM projects
       ORDER BY order_index ASC, created_at DESC`
    );
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      tagline: r.tagline,
      description: r.description,
      image: r.image,
      tags: Array.isArray(r.tags) ? r.tags : JSON.parse(r.tags || "[]"),
      githubUrl: r.githubUrl || undefined,
      liveUrl: r.liveUrl || undefined,
      features: Array.isArray(r.features) ? r.features : JSON.parse(r.features || "[]"),
      metrics: r.metrics || undefined,
      order_index: r.order_index,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
  } catch (error) {
    console.error("Error reading projects from PostgreSQL:", error);
    return [];
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, category, tagline, description, image, tags,
              github_url as "githubUrl", live_url as "liveUrl", features, metrics, order_index,
              created_at, updated_at
       FROM projects
       WHERE id = $1`,
      [id]
    );
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      title: r.title,
      category: r.category,
      tagline: r.tagline,
      description: r.description,
      image: r.image,
      tags: Array.isArray(r.tags) ? r.tags : JSON.parse(r.tags || "[]"),
      githubUrl: r.githubUrl || undefined,
      liveUrl: r.liveUrl || undefined,
      features: Array.isArray(r.features) ? r.features : JSON.parse(r.features || "[]"),
      metrics: r.metrics || undefined,
      order_index: r.order_index,
      created_at: r.created_at,
      updated_at: r.updated_at,
    };
  } catch (error) {
    console.error(`Error reading project '${id}' from PostgreSQL:`, error);
    return null;
  }
}

export async function createProject(p: Project): Promise<Project> {
  const { rows } = await pool.query(
    `INSERT INTO projects (id, title, category, tagline, description, image, tags, github_url, live_url, features, metrics, order_index)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, (SELECT COALESCE(MAX(order_index), 0) + 1 FROM projects))
     RETURNING id, title, category, tagline, description, image, tags,
               github_url as "githubUrl", live_url as "liveUrl", features, metrics, order_index,
               created_at, updated_at`,
    [
      p.id,
      p.title,
      p.category,
      p.tagline,
      p.description,
      p.image,
      JSON.stringify(p.tags || []),
      p.githubUrl || "",
      p.liveUrl || "",
      JSON.stringify(p.features || []),
      p.metrics || "",
    ]
  );
  const r = rows[0];
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    tagline: r.tagline,
    description: r.description,
    image: r.image,
    tags: Array.isArray(r.tags) ? r.tags : JSON.parse(r.tags || "[]"),
    githubUrl: r.githubUrl || undefined,
    liveUrl: r.liveUrl || undefined,
    features: Array.isArray(r.features) ? r.features : JSON.parse(r.features || "[]"),
    metrics: r.metrics || undefined,
    order_index: r.order_index,
  };
}

export async function updateProject(
  id: string,
  p: Partial<Project>
): Promise<Project> {
  const current = await getProjectById(id);
  if (!current) {
    throw new Error(`Project dengan ID '${id}' tidak ditemukan.`);
  }

  const updatedTitle = p.title !== undefined ? p.title : current.title;
  const updatedCategory = p.category !== undefined ? p.category : current.category;
  const updatedTagline = p.tagline !== undefined ? p.tagline : current.tagline;
  const updatedDescription = p.description !== undefined ? p.description : current.description;
  const updatedImage = p.image !== undefined ? p.image : current.image;
  const updatedTags = p.tags !== undefined ? JSON.stringify(p.tags) : JSON.stringify(current.tags);
  const updatedGithub = p.githubUrl !== undefined ? p.githubUrl : (current.githubUrl || "");
  const updatedLive = p.liveUrl !== undefined ? p.liveUrl : (current.liveUrl || "");
  const updatedFeatures = p.features !== undefined ? JSON.stringify(p.features) : JSON.stringify(current.features);
  const updatedMetrics = p.metrics !== undefined ? p.metrics : (current.metrics || "");

  const { rows } = await pool.query(
    `UPDATE projects
     SET title = $1, category = $2, tagline = $3, description = $4,
         image = $5, tags = $6, github_url = $7, live_url = $8,
         features = $9, metrics = $10, updated_at = CURRENT_TIMESTAMP
     WHERE id = $11
     RETURNING id, title, category, tagline, description, image, tags,
               github_url as "githubUrl", live_url as "liveUrl", features, metrics, order_index,
               created_at, updated_at`,
    [
      updatedTitle,
      updatedCategory,
      updatedTagline,
      updatedDescription,
      updatedImage,
      updatedTags,
      updatedGithub,
      updatedLive,
      updatedFeatures,
      updatedMetrics,
      id,
    ]
  );

  const r = rows[0];
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    tagline: r.tagline,
    description: r.description,
    image: r.image,
    tags: Array.isArray(r.tags) ? r.tags : JSON.parse(r.tags || "[]"),
    githubUrl: r.githubUrl || undefined,
    liveUrl: r.liveUrl || undefined,
    features: Array.isArray(r.features) ? r.features : JSON.parse(r.features || "[]"),
    metrics: r.metrics || undefined,
    order_index: r.order_index,
  };
}

export async function deleteProject(id: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM projects WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * ==========================================
 * EXPERIENCES CRUD
 * ==========================================
 */

export async function getExperiences(): Promise<ExperienceItem[]> {
  try {
    const { rows } = await pool.query(
      `SELECT id, period, role, organization, location, type, description, highlights, order_index, created_at
       FROM experiences
       ORDER BY order_index ASC, id ASC`
    );
    return rows.map((r) => ({
      id: r.id,
      period: r.period,
      role: r.role,
      organization: r.organization,
      location: r.location,
      type: r.type,
      description: r.description,
      highlights: Array.isArray(r.highlights) ? r.highlights : JSON.parse(r.highlights || "[]"),
      order_index: r.order_index,
      created_at: r.created_at,
    }));
  } catch (error) {
    console.error("Error fetching experiences from PostgreSQL:", error);
    return [];
  }
}

export async function getExperienceById(id: number): Promise<ExperienceItem | null> {
  try {
    const { rows } = await pool.query(
      `SELECT id, period, role, organization, location, type, description, highlights, order_index, created_at
       FROM experiences
       WHERE id = $1`,
      [id]
    );
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      period: r.period,
      role: r.role,
      organization: r.organization,
      location: r.location,
      type: r.type,
      description: r.description,
      highlights: Array.isArray(r.highlights) ? r.highlights : JSON.parse(r.highlights || "[]"),
      order_index: r.order_index,
      created_at: r.created_at,
    };
  } catch (error) {
    console.error(`Error fetching experience '${id}' from PostgreSQL:`, error);
    return null;
  }
}

export async function createExperience(exp: Omit<ExperienceItem, "id">): Promise<ExperienceItem> {
  const { rows } = await pool.query(
    `INSERT INTO experiences (period, role, organization, location, type, description, highlights, order_index)
     VALUES ($1, $2, $3, $4, $5, $6, $7, (SELECT COALESCE(MAX(order_index), 0) + 1 FROM experiences))
     RETURNING id, period, role, organization, location, type, description, highlights, order_index, created_at`,
    [
      exp.period,
      exp.role,
      exp.organization,
      exp.location,
      exp.type,
      exp.description,
      JSON.stringify(exp.highlights || []),
    ]
  );
  const r = rows[0];
  return {
    id: r.id,
    period: r.period,
    role: r.role,
    organization: r.organization,
    location: r.location,
    type: r.type,
    description: r.description,
    highlights: Array.isArray(r.highlights) ? r.highlights : JSON.parse(r.highlights || "[]"),
    order_index: r.order_index,
    created_at: r.created_at,
  };
}

export async function updateExperience(
  id: number,
  exp: Partial<ExperienceItem>
): Promise<ExperienceItem> {
  const current = await getExperienceById(id);
  if (!current) {
    throw new Error(`Pengalaman dengan ID '${id}' tidak ditemukan.`);
  }

  const period = exp.period ?? current.period;
  const role = exp.role ?? current.role;
  const organization = exp.organization ?? current.organization;
  const location = exp.location ?? current.location;
  const type = exp.type ?? current.type;
  const description = exp.description ?? current.description;
  const highlights = exp.highlights ? JSON.stringify(exp.highlights) : JSON.stringify(current.highlights);

  const { rows } = await pool.query(
    `UPDATE experiences
     SET period = $1, role = $2, organization = $3, location = $4,
         type = $5, description = $6, highlights = $7, updated_at = CURRENT_TIMESTAMP
     WHERE id = $8
     RETURNING id, period, role, organization, location, type, description, highlights, order_index, created_at`,
    [period, role, organization, location, type, description, highlights, id]
  );
  const r = rows[0];
  return {
    id: r.id,
    period: r.period,
    role: r.role,
    organization: r.organization,
    location: r.location,
    type: r.type,
    description: r.description,
    highlights: Array.isArray(r.highlights) ? r.highlights : JSON.parse(r.highlights || "[]"),
    order_index: r.order_index,
    created_at: r.created_at,
  };
}

export async function deleteExperience(id: number): Promise<boolean> {
  const result = await pool.query("DELETE FROM experiences WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * ==========================================
 * SKILLS CRUD
 * ==========================================
 */

export async function getSkills(): Promise<SkillItem[]> {
  try {
    const { rows } = await pool.query(
      `SELECT id, category, name, icon, order_index
       FROM skills
       ORDER BY category ASC, order_index ASC, id ASC`
    );
    return rows.map((r) => ({
      id: r.id,
      category: r.category,
      name: r.name,
      icon: r.icon,
      order_index: r.order_index,
    }));
  } catch (error) {
    console.error("Error fetching skills from PostgreSQL:", error);
    return [];
  }
}

export async function getSkillsGrouped(): Promise<SkillCategoryGroup[]> {
  const allSkills = await getSkills();
  const groupMap = new Map<string, SkillItem[]>();

  for (const s of allSkills) {
    const cat = s.category || "General";
    if (!groupMap.has(cat)) {
      groupMap.set(cat, []);
    }
    groupMap.get(cat)!.push({
      id: s.id,
      name: s.name,
      icon: s.icon,
      order_index: s.order_index,
    });
  }

  return Array.from(groupMap.entries()).map(([category, skills]) => ({
    category,
    skills,
  }));
}

export async function createSkill(
  skill: { name: string; category: string; icon: string }
): Promise<SkillItem> {
  const { rows } = await pool.query(
    `INSERT INTO skills (category, name, icon, order_index)
     VALUES ($1, $2, $3, (SELECT COALESCE(MAX(order_index), 0) + 1 FROM skills WHERE category = $1))
     RETURNING id, category, name, icon, order_index`,
    [skill.category, skill.name, skill.icon]
  );
  const r = rows[0];
  return {
    id: r.id,
    category: r.category,
    name: r.name,
    icon: r.icon,
    order_index: r.order_index,
  };
}

export async function updateSkill(
  id: number,
  skill: { name?: string; category?: string; icon?: string }
): Promise<SkillItem> {
  const { rows: currentRows } = await pool.query("SELECT * FROM skills WHERE id = $1", [id]);
  if (currentRows.length === 0) {
    throw new Error(`Skill dengan ID '${id}' tidak ditemukan.`);
  }
  const curr = currentRows[0];
  const name = skill.name ?? curr.name;
  const category = skill.category ?? curr.category;
  const icon = skill.icon ?? curr.icon;

  const { rows } = await pool.query(
    `UPDATE skills
     SET name = $1, category = $2, icon = $3
     WHERE id = $4
     RETURNING id, category, name, icon, order_index`,
    [name, category, icon, id]
  );
  const r = rows[0];
  return {
    id: r.id,
    category: r.category,
    name: r.name,
    icon: r.icon,
    order_index: r.order_index,
  };
}

export async function deleteSkill(id: number): Promise<boolean> {
  const result = await pool.query("DELETE FROM skills WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * ==========================================
 * PROFILE / PERSONAL INFO CRUD
 * ==========================================
 */

export async function getProfileInfo(): Promise<PersonalInfo> {
  try {
    const { rows } = await pool.query(
      `SELECT name, handle, title, institution, location, email,
              linkedin, github, quote, about, about_sub as "aboutSub"
       FROM profile_info
       WHERE id = 'default'`
    );
    if (rows.length > 0) {
      return rows[0] as PersonalInfo;
    }
  } catch (error) {
    console.error("Error reading profile info from PostgreSQL:", error);
  }

  // Fallback
  return {
    name: "FALAH",
    handle: "FALAA-1285",
    title: "Web Developer & IT Student",
    institution: "Politeknik Negeri Malang (Polinema)",
    location: "Malang, Indonesia",
    email: "ahmadfalahi1285@gmail.com",
    linkedin: "https://www.linkedin.com/in/ahmad-falahi-8507a4313/",
    github: "https://github.com/FALAA-1285",
    quote: "First make it work, then make it clean, and finally make it fast.",
    about:
      "I am an Information Technology Undergraduate at Politeknik Negeri Malang, passionate about building clean, responsive, and user-friendly websites. I enjoy turning complex ideas into clear, functional, and engaging web applications with a focus on simplicity, performance, and impact.",
    aboutSub:
      "Specializing in Web Development while actively exploring Flutter & Dart for cross-platform mobile apps, Django for backend architectures, and Machine Learning & Computer Vision for smart automation.",
  };
}

export async function updateProfileInfo(info: PersonalInfo): Promise<PersonalInfo> {
  const { rows } = await pool.query(
    `INSERT INTO profile_info (id, name, handle, title, institution, location, email, linkedin, github, quote, about, about_sub, updated_at)
     VALUES ('default', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO UPDATE
     SET name = EXCLUDED.name,
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
         updated_at = CURRENT_TIMESTAMP
     RETURNING name, handle, title, institution, location, email,
               linkedin, github, quote, about, about_sub as "aboutSub"`,
    [
      info.name,
      info.handle,
      info.title,
      info.institution,
      info.location,
      info.email,
      info.linkedin,
      info.github,
      info.quote,
      info.about,
      info.aboutSub,
    ]
  );
  return rows[0] as PersonalInfo;
}

/**
 * ==========================================
 * MESSAGES / INQUIRIES CRUD
 * ==========================================
 */

export async function getMessages(): Promise<ContactMessage[]> {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, subject, message, is_read, created_at
       FROM messages
       ORDER BY created_at DESC`
    );
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      subject: r.subject || undefined,
      message: r.message,
      is_read: r.is_read,
      created_at: r.created_at,
    }));
  } catch (error) {
    console.error("Error fetching messages from PostgreSQL:", error);
    return [];
  }
}

export async function createMessage(msg: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<ContactMessage> {
  const { rows } = await pool.query(
    `INSERT INTO messages (name, email, subject, message)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, subject, message, is_read, created_at`,
    [msg.name, msg.email, msg.subject || "", msg.message]
  );
  return rows[0] as ContactMessage;
}

export async function toggleMessageRead(id: number, isRead: boolean): Promise<boolean> {
  const result = await pool.query(
    "UPDATE messages SET is_read = $1 WHERE id = $2",
    [isRead, id]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function deleteMessage(id: number): Promise<boolean> {
  const result = await pool.query("DELETE FROM messages WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}
