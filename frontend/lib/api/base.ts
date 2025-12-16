import { getApiToken } from "./token-manager";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
export const REQUEST_TIMEOUT = 300000; //* 300 seconds (5 minutes) - Image generation can take 2-3 minutes

/**
 * Get authentication headers with Clerk session token
 * Automatically uses token from token manager if not provided
 */
export async function getAuthHeaders(
  token?: string | null,
): Promise<HeadersInit> {
  const authToken = token ?? getApiToken();
  return {
    "Content-Type": "application/json",
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };
}

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = REQUEST_TIMEOUT,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  //* If an external signal is provided (e.g., from React Query), abort our request when it aborts
  const externalSignal = options.signal;
  if (externalSignal) {
    externalSignal.addEventListener("abort", () => {
      controller.abort();
    });
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: "include", //* Include cookies for Clerk session
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      //* Check if it was an external abort vs timeout
      if (externalSignal?.aborted) {
        throw new Error("Request cancelled");
      }
      throw new Error(
        `Request timed out after ${timeout / 1000} seconds. Please try again.`,
      );
    }
    throw error;
  }
}
