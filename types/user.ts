
export interface UserImage {
    link: string | null;
    versions: {
        large: string | null;
        medium: string | null;
        small: string | null;
        micro: string | null;
    };
}

export interface Skill {
    id: number;
    name: string;
    level: number;
}

export interface ProjectUser {
    id: number;
    occurrence: number;
    final_mark: number | null;
    status: 'finished' | 'in_progress' | 'waiting_for_correction' | 'searching_a_group' | 'creating_group' | 'parent';
    validated?: boolean | null;
    current_team_id: number | null;
    project: {
        id: number;
        name: string;
        slug: string;
        parent_id: number | null;
    };
    cursus_ids: number[];
    created_at: string;
    updated_at: string;
    marked_at: string | null;
    marked: boolean;
    retriable_at: string | null;
}

export interface CursusUser {
  id: number;
  begin_at: string;
  end_at: string | null;
  grade: string | null;
  level: number;
  skills: Skill[];
  cursus_id: number;
  has_coalition: boolean;
  blackholed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  login: string;
  first_name: string;
  last_name: string;
  usual_full_name: string;
  displayname: string;
  kind: string;
  image: UserImage;
  'staff?': boolean;
  correction_point: number;
  pool_month: string | null;
  pool_year: string | null;
  location: string | null;
  wallet: number;
  created_at: string;
  updated_at: string;
  'alumni?': boolean;
  'active?': boolean;
  cursus_users: CursusUser[];
  projects_users: ProjectUser[];
}