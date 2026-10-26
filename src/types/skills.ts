export interface SkillItem {
  name: string;
  icon: string;
}

export interface SkillCategoryGroup {
  category: string;
  skills: SkillItem[];
}
