import { pool } from "./pool";
import type { PersonalInfo } from "@/types/portfolio";
import { DEFAULT_PERSONAL_INFO } from "@/lib/constants";

export async function getProfileInfo(): Promise<PersonalInfo> {
  try {
    const { rows } = await pool.query(
      `SELECT name, handle, title, institution, location, email,
              linkedin, github, quote, about, about_sub as "aboutSub",
              about_headline as "aboutHeadline",
              about_tags as "aboutTags",
              cta_headline as "ctaHeadline",
              cta_sub as "ctaSub",
              cta_button_text as "ctaButtonText"
       FROM profile_info
       WHERE id = 'default'`
    );
    if (rows.length > 0) {
      const r = rows[0];
      return {
        ...r,
        aboutTags: Array.isArray(r.aboutTags)
          ? r.aboutTags
          : JSON.parse(
              r.aboutTags ||
                '["Web Development", "Mobile App Development", "API Development", "UI/UX Design"]'
            ),
        aboutHeadline:
          r.aboutHeadline || DEFAULT_PERSONAL_INFO.aboutHeadline,
        ctaHeadline: r.ctaHeadline || DEFAULT_PERSONAL_INFO.ctaHeadline,
        ctaSub: r.ctaSub || DEFAULT_PERSONAL_INFO.ctaSub,
        ctaButtonText: r.ctaButtonText || DEFAULT_PERSONAL_INFO.ctaButtonText,
      } as PersonalInfo;
    }
  } catch (error) {
    console.error("Error reading profile info from PostgreSQL:", error);
  }

  // Fallback to constant defaults
  return DEFAULT_PERSONAL_INFO;
}

export async function updateProfileInfo(info: PersonalInfo): Promise<PersonalInfo> {
  const { rows } = await pool.query(
    `INSERT INTO profile_info (
       id, name, handle, title, institution, location, email,
       linkedin, github, quote, about, about_sub,
       about_headline, about_tags, cta_headline, cta_sub, cta_button_text,
       updated_at
     )
     VALUES ('default', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP)
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
         about_headline = EXCLUDED.about_headline,
         about_tags = EXCLUDED.about_tags,
         cta_headline = EXCLUDED.cta_headline,
         cta_sub = EXCLUDED.cta_sub,
         cta_button_text = EXCLUDED.cta_button_text,
         updated_at = CURRENT_TIMESTAMP
     RETURNING name, handle, title, institution, location, email,
               linkedin, github, quote, about, about_sub as "aboutSub",
               about_headline as "aboutHeadline",
               about_tags as "aboutTags",
               cta_headline as "ctaHeadline",
               cta_sub as "ctaSub",
               cta_button_text as "ctaButtonText"`,
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
      info.aboutHeadline || DEFAULT_PERSONAL_INFO.aboutHeadline,
      JSON.stringify(info.aboutTags || DEFAULT_PERSONAL_INFO.aboutTags),
      info.ctaHeadline || DEFAULT_PERSONAL_INFO.ctaHeadline,
      info.ctaSub || DEFAULT_PERSONAL_INFO.ctaSub,
      info.ctaButtonText || DEFAULT_PERSONAL_INFO.ctaButtonText,
    ]
  );
  const r = rows[0];
  return {
    ...r,
    aboutTags: Array.isArray(r.aboutTags) ? r.aboutTags : JSON.parse(r.aboutTags || "[]"),
  } as PersonalInfo;
}
