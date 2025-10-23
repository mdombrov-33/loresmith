"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useAppStore } from "@/stores/appStore";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { THEMES } from "@/constants/game-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme: storeTheme } = useAppStore();
  const { setTheme: setNextTheme } = useTheme();

  useEffect(() => {
    setNextTheme(storeTheme);
  }, [storeTheme, setNextTheme]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={storeTheme}
      themes={[
        THEMES.FANTASY,
        THEMES.NORSE,
        THEMES.CYBERPUNK,
        THEMES.POST_APOCALYPTIC,
        THEMES.STEAMPUNK,
      ]}
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
