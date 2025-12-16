"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { setApiToken } from "@/lib/api/token-manager";

/**
 * Automatically syncs Clerk auth token to API client
 */
export function AuthTokenProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    const updateToken = async () => {
      if (isSignedIn) {
        const token = await getToken();
        setApiToken(token);
      } else {
        setApiToken(null);
      }
    };

    updateToken();
  }, [getToken, isSignedIn]);

  return <>{children}</>;
}
