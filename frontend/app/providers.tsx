"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, //* 5 minutes
      retry: (failureCount, error) => {
        //* Don't retry on network errors or timeouts
        if (
          error instanceof Error &&
          (error.message.includes("Failed to fetch") ||
            error.message.includes("timed out"))
        ) {
          return false;
        }
        //* Retry up to 3 times for other errors
        return failureCount < 3;
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
