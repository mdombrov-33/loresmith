"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { THEME_OPTIONS } from "@/constants/game-themes";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  //* Sync theme from query params on mount
  useEffect(() => {
    if (!mounted) return;

    const themeFromQuery = searchParams.get("theme");
    if (themeFromQuery && theme !== themeFromQuery) {
      setTheme(themeFromQuery);
    }
  }, [mounted, searchParams, theme, setTheme]);

  const handleThemeChange = (newTheme: string) => {
    if (theme === newTheme) return;

    setTheme(newTheme);

    //* Update query param
    const params = new URLSearchParams(searchParams.toString());
    params.set("theme", newTheme);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (!mounted) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        {THEME_OPTIONS.map((t) => {
          const Icon = t.icon;
          return (
            <Button
              key={t.value}
              variant="outline"
              size="sm"
              disabled
              className="text-sm"
            >
              <span className="mr-1.5">
                <Icon />
              </span>
              {t.label}
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {THEME_OPTIONS.map((t) => {
        const Icon = t.icon;
        return (
          <Button
            key={t.value}
            variant={theme === t.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleThemeChange(t.value)}
            className="text-sm"
          >
            <span className="mr-1.5">
              <Icon />
            </span>
            {t.label}
          </Button>
        );
      })}
    </div>
  );
}
