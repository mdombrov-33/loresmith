"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { useAppStore } from "@/stores/appStore";
import { API_BASE_URL, fetchWithTimeout, getAuthHeaders } from "@/lib/api/base";

/**
 * UserSyncProvider fetches the current user from the backend and syncs to Zustand
 * This ensures Zustand always has the correct authenticated user data
 */
export function UserSyncProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { login, logout } = useAppStore();

  useEffect(() => {
    async function syncUser() {
      if (!isLoaded) return;

      if (!isSignedIn) {
        logout();
        return;
      }

      try {
        const token = await getToken();
        const response = await fetchWithTimeout(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          headers: await getAuthHeaders(token),
        });

        if (!response.ok) {
          console.error(
            "[UserSync] Failed to fetch user:",
            response.statusText,
          );
          logout();
          return;
        }

        const data = await response.json();
        if (data.user) {
          login(data.user);
        }
      } catch (error) {
        console.error("[UserSync] Error fetching user:", error);
        logout();
      }
    }

    syncUser();
  }, [isSignedIn, isLoaded, getToken, login, logout]);

  return <>{children}</>;
}
