export interface AboutImage {
  url: string;
  label: string;
  icon: string;
}

export interface DepartmentItem {
  id: string;
  icon: string;
  name: string;
  description: string;
  gradient?: string;
  glowColor?: string;
}

export interface AchievementItem {
  id: string;
  year: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface HeroConfig {
  badge?: string;
  headline?: string;
  subtitle: string;
  imageUrl?: string;
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
}

export interface AboutConfig {
  badge?: string;
  title?: string;
  paragraphs: string[];
  imageLarge?: AboutImage;
  imageSmall1?: AboutImage;
  imageSmall2?: AboutImage;
}

export interface DepartmentSectionConfig {
  badge?: string;
  title: string;
  subtitle?: string;
  items: DepartmentItem[];
}

export interface AchievementSectionConfig {
  badge?: string;
  title: string;
  subtitle?: string;
  items: AchievementItem[];
}

export interface HomepageConfig {
  hero: HeroConfig;
  about: AboutConfig;
  departments: DepartmentSectionConfig;
  achievements: AchievementSectionConfig;
}
