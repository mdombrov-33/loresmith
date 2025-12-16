export interface Job {
  id: string;
  type: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  message: string;
  payload: Record<string, unknown>;
  result?: unknown;
  error?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface JobRequest {
  type: string;
  payload: Record<string, unknown>;
}
