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
