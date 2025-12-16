import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { getWorld, getWorlds, deleteWorld, updateWorldVisibility, rateWorld } from "@/lib/api/world";
import { getAuthHeaders } from "@/lib/api/base";
import { API_BASE_URL, fetchWithTimeout } from "@/lib/api/base";
import { queryKeys } from "./keys";

export function useWorld(worldId: number) {
  const { getToken, isLoaded } = useAuth();

  return useQuery({
    queryKey: queryKeys.world(worldId),
    queryFn: async () => {
      const token = await getToken();
      const url = `${API_BASE_URL}/worlds/${worldId}`;
      const response = await fetchWithTimeout(url, {
        method: "GET",
        headers: await getAuthHeaders(token),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch world: ${response.statusText}`);
      }
      const data = await response.json();
      return data.world;
    },
    enabled: !!worldId && !isNaN(worldId) && isLoaded,
    retry: false, //* Don't retry on 404 or auth errors
  });
}

export function useWorlds(filters?: {
  scope?: "my" | "global";
  theme?: string;
  status?: string;
  limit?: number;
  offset?: number;
  search?: string;
  sort?: string;
}) {
  const { getToken, isLoaded } = useAuth();
  const isSearchQuery = filters?.search && filters.search.trim();

  return useQuery({
    queryKey: queryKeys.worlds(filters),
    queryFn: async () => {
      const token = await getToken();

      let url: URL;
      if (filters?.search) {
        url = new URL(`${API_BASE_URL}/worlds/search`);
        url.searchParams.set("q", filters.search);
        if (filters.scope) url.searchParams.set("scope", filters.scope);
        if (filters.theme) url.searchParams.set("theme", filters.theme);
        if (filters.status) url.searchParams.set("status", filters.status);
        if (isSearchQuery) {
          url.searchParams.set("limit", "100");
          url.searchParams.set("offset", "0");
        } else {
          if (filters.limit) url.searchParams.set("limit", filters.limit.toString());
          if (filters.offset) url.searchParams.set("offset", filters.offset.toString());
        }
      } else {
        url = new URL(`${API_BASE_URL}/worlds`);
        if (filters) {
          if (filters.scope) url.searchParams.set("scope", filters.scope);
          if (filters.theme) url.searchParams.set("theme", filters.theme);
          if (filters.status) url.searchParams.set("status", filters.status);
          if (filters.sort) url.searchParams.set("sort", filters.sort);
          if (filters.limit) url.searchParams.set("limit", filters.limit.toString());
          if (filters.offset) url.searchParams.set("offset", filters.offset.toString());
        }
      }

      const response = await fetchWithTimeout(url.toString(), {
        method: "GET",
        headers: await getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch worlds: ${response.statusText}`);
      }

      const data = await response.json();
      return { worlds: data.worlds || [], total: data.total || 0 };
    },
    enabled: isLoaded, //* Wait for Clerk to load
  });
}

export function useDeleteWorld() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (worldId: number) => {
      const token = await getToken();
      const url = `${API_BASE_URL}/worlds/${worldId}`;
      const response = await fetchWithTimeout(url, {
        method: "DELETE",
        headers: await getAuthHeaders(token),
      });
      if (!response.ok) {
        throw new Error(`Failed to delete world: ${response.statusText}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worlds"] });
    },
  });
}

export function useUpdateWorldVisibility() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ worldId, visibility }: { worldId: number; visibility: "private" | "published" }) => {
      const token = await getToken();
      const url = `${API_BASE_URL}/worlds/${worldId}/visibility`;
      const response = await fetchWithTimeout(url, {
        method: "PATCH",
        headers: await getAuthHeaders(token),
        body: JSON.stringify({ visibility }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update world visibility: ${response.statusText}`);
      }
    },
    onSuccess: (_, { worldId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.world(worldId) });
      queryClient.invalidateQueries({ queryKey: ["worlds"] });
    },
  });
}

export function useRateWorld() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ worldId, rating }: { worldId: number; rating: number }) => {
      const token = await getToken();
      const url = `${API_BASE_URL}/worlds/${worldId}/rate`;
      const response = await fetchWithTimeout(url, {
        method: "PATCH",
        headers: await getAuthHeaders(token),
        body: JSON.stringify({ rating }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to rate world: ${response.statusText}`);
      }
      const data = await response.json();
      return {
        avg_rating: data.avg_rating,
        rating_count: data.rating_count,
        user_rating: data.user_rating,
      };
    },
    onSuccess: (_, { worldId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.world(worldId) });
      queryClient.invalidateQueries({ queryKey: ["worlds"] });
    },
  });
}
