export interface Project {
  id: number;
  title: string;
  description?: string;
  tech_stack: string[];
  github_url?: string;
  featured: boolean;
  category?: string;
  difficulty: number;
}
export interface SocialLink {
  platform: string;
  url: string;
}

export interface About {
  name: string;
  title: string;
  bio: string;
  profile_pic: string;
  skills: string[];
  socials: SocialLink[];
}

export interface CreativeItem {
  id: number;
  title: string;
  description: string;
  tech: string;
  video_path: string;
}

export interface LifePost {
  id: number;
  title: string;
  caption: string;
  image_url: string;
  category: string;
  created_at: string;
}
