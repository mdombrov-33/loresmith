import { LorePiece } from "@/types/generate-world";

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

export interface FullStory {
  title?: string;
  content?: string;
  theme?: string;
  quest?: {
    title?: string;
    description?: string;
  };
  pieces?: Partial<Record<string, LorePiece | undefined>>;
}
