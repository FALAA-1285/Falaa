export interface SkillItem {
  id?: number;
  name: string;
  icon: string;
  category?: string;
  order_index?: number;
}

export interface SkillCategoryGroup {
  category: string;
  skills: SkillItem[];
}
