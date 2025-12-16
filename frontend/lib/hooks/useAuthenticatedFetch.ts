import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";
import { fetchWithTimeout, getAuthHeaders } from "../api/base";

/**
 * Hook that provides authenticated fetch with automatic token injection
 * Use this for all API calls that need authentication
 */
export function useAuthenticatedFetch() {
  const { getToken } = useAuth();

  const authenticatedFetch = useCallback(
    async (url: string, options?: RequestInit) => {
      const token = await getToken();
      const headers = await getAuthHeaders(token);

      return fetchWithTimeout(url, {
        ...options,
        headers: {
          ...headers,
          ...options?.headers,
        },
      });
    },
    [getToken]
  );

  return authenticatedFetch;
}

/**
 * Hook that provides getToken for queries that need to build custom requests
 */
export function useClerkToken() {
  const { getToken, isLoaded } = useAuth();
  return { getToken, isLoaded };
}
