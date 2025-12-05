"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useAppStore } from "@/stores/appStore";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { THEMES } from "@/constants/game-themes";

function ThemeSyncronizer() {
  const { theme: storeTheme } = useAppStore();
  const { setTheme: setNextTheme, theme: currentTheme } = useTheme();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const selectedThemeParam = searchParams.get("theme");

  useEffect(() => {
    //* Define paths where custom themes should be used
    const customThemePaths = [
      "/generate",
      "/worlds",
      "/adventure",
    ];

    //* Check if current path should use custom theme
    const shouldUseCustomTheme = customThemePaths.some(path => pathname?.startsWith(path));

    let targetTheme: string;

    //* Special case: select-theme page with theme parameter (preview)
    if (pathname === "/select-theme" && selectedThemeParam) {
      targetTheme = selectedThemeParam;
    } else if (shouldUseCustomTheme && storeTheme) {
      //* Use selected theme for generation/worlds/adventure flows
      targetTheme = storeTheme;
    } else {
      //* Use default base theme for navigation pages (my-worlds, discover, plans, home, etc.)
      targetTheme = "default";
    }

    //* Only update if the theme actually changed
    if (currentTheme !== targetTheme) {
      setNextTheme(targetTheme);
    }
  }, [storeTheme, setNextTheme, selectedThemeParam, pathname, currentTheme]);

  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme: storeTheme, isHydrated } = useAppStore();

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="default"
      themes={[
        "default",
        THEMES.FANTASY,
        THEMES.NORSE,
        THEMES.CYBERPUNK,
        THEMES.POST_APOCALYPTIC,
        THEMES.STEAMPUNK,
      ]}
      enableSystem={false}
      disableTransitionOnChange={true}
    >
      {isHydrated && <ThemeSyncronizer />}
      {children}
    </NextThemesProvider>
  );
}
