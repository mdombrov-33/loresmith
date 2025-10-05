"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";
import { THEMES } from "@/constants/game-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={THEMES.FANTASY}
      themes={[
        THEMES.FANTASY,
        THEMES.NORSE,
        THEMES.CYBERPUNK,
        THEMES.POST_APOCALYPTIC,
        THEMES.STEAMPUNK,
      ]}
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
