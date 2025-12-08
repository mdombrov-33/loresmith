import { API_BASE_URL, fetchWithTimeout, getAuthHeaders } from "./base";

export interface Job {
  id: string;
  type: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  message: string;
  payload: Record<string, any>;
  result?: any;
  error?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface JobRequest {
  type: string;
  payload: Record<string, any>;
}

/**
 * Submit a new job to the backend
 */
export async function submitJob(request: JobRequest): Promise<Job> {
  const url = `${API_BASE_URL}/jobs`;

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to submit job: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Poll for job status
 */
export async function getJobStatus(jobId: string): Promise<Job> {
  const url = `${API_BASE_URL}/jobs/${jobId}`;

  const response = await fetchWithTimeout(url, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Job not found: ${jobId}`);
    }
    throw new Error(`Failed to get job status: ${response.statusText}`);
  }

  return await response.json();
}
