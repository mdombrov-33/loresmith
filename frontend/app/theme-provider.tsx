"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useAppStore } from "@/stores/appStore";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { THEMES } from "@/constants/game-themes";

function ThemeSyncronizer() {
  const { theme: storeTheme } = useAppStore();
  const { setTheme: setNextTheme } = useTheme();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const selectedThemeParam = searchParams.get("theme");

  useEffect(() => {
    let targetTheme: string;

    //* Special case: select-theme page with theme parameter (preview)
    if (pathname === "/select-theme" && selectedThemeParam) {
      targetTheme = selectedThemeParam;
    }
    //* Special case: worlds page - extract theme from URL
    else if (pathname?.startsWith("/worlds/")) {
      const pathSegments = pathname.split("/");
      targetTheme = pathSegments[2] || storeTheme || "default";
    }
    //* Generate and adventure pages - use store theme
    else if (pathname?.startsWith("/generate") || pathname?.startsWith("/adventure")) {
      targetTheme = storeTheme || "default";
    }
    //* Default theme for navigation pages (my-worlds, discover, plans, home, etc.)
    else {
      targetTheme = "default";
    }

    setNextTheme(targetTheme);
  }, [storeTheme, setNextTheme, selectedThemeParam, pathname]);

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
