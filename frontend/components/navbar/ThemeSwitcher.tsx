"use client";

import { useTheme } from "next-themes";
import ActionButton from "@/components/shared/ActionButton";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { THEME_OPTIONS } from "@/constants/game-themes";
import { useAppStore } from "@/stores/appStore";

export function ThemeSwitcher() {
  const { setTheme: setNextTheme } = useTheme();
  const {
    theme: storeTheme,
    setTheme: setStoreTheme,
    setUserChangedTheme,
  } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    if (storeTheme === newTheme) return;

    setStoreTheme(newTheme);
    setUserChangedTheme(true);
    setNextTheme(newTheme);

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
            <ActionButton
              key={t.value}
              variant="outline"
              size="sm"
              disabled
              icon={<Icon />}
              className="text-sm"
            >
              {t.label}
            </ActionButton>
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
          <ActionButton
            key={t.value}
            variant={storeTheme === t.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleThemeChange(t.value)}
            icon={<Icon />}
            className="text-sm"
          >
            {t.label}
          </ActionButton>
        );
      })}
    </div>
  );
}
