export interface LorePiece {
  id: number;
  world_id: number;
  type: string;
  name: string;
  description: string;
  details: Record<string, string>;
  created_at: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export interface RegisterResponse {
  user: {
    id: number;
    username: string;
    email: string;
    created_at: string;
    updated_at: string;
  };
}

export interface SelectedLorePieces {
  character?: LorePiece;
  faction?: LorePiece;
  setting?: LorePiece;
  event?: LorePiece;
  relic?: LorePiece;
}

export interface FullStory {
  title?: string;
  content?: string;
  theme?: string;
  quest?: {
    title?: string;
    description?: string;
  };
  pieces?: SelectedLorePieces;
}

export interface World {
  id: number;
  user_id: number;
  user_name?: string;
  status: string;
  theme: string;
  full_story: string;
  lore_pieces?: LorePiece[];
  session_id?: number;
  created_at: string;
  updated_at: string;
  relevance?: number;
}
