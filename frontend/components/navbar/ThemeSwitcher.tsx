"use client";

import { useTheme } from "next-themes";
import ActionButton from "@/components/shared/ActionButton";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { THEME_OPTIONS } from "@/constants/game-themes";
import { useAppStore } from "@/stores/appStore";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface ThemeSwitcherProps {
  variant?: "desktop" | "mobile" | "popover";
}

const DESKTOP_VISIBLE_THEMES = 4; // Show first 4 themes as buttons

export function ThemeSwitcher({ variant = "desktop" }: ThemeSwitcherProps) {
  const { setTheme: setNextTheme } = useTheme();
  const {
    theme: storeTheme,
    setTheme: setStoreTheme,
    setUserChangedTheme,
  } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
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

    // Close popover after selection
    if (variant === "popover") {
      setPopoverOpen(false);
    }
  };

  // Popover variant - trigger button + grid
  if (variant === "popover") {
    if (!mounted) {
      return (
        <Button variant="outline" size="sm" disabled className="gap-2">
          <span className="text-sm">Themes</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      );
    }

    const currentTheme = THEME_OPTIONS.find((t) => t.value === storeTheme);
    const CurrentIcon = currentTheme?.icon;

    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {CurrentIcon && <CurrentIcon className="h-4 w-4" />}
            <span className="hidden sm:inline text-sm">{currentTheme?.label}</span>
            <span className="sm:hidden text-sm">Themes</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-4" align="center">
          <div className="mb-3">
            <h4 className="text-foreground text-sm font-semibold">Select Theme</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {THEME_OPTIONS.map((theme) => {
              const Icon = theme.icon;
              const isSelected = storeTheme === theme.value;
              return (
                <button
                  key={theme.value}
                  onClick={() => handleThemeChange(theme.value)}
                  className={`border-border hover:bg-accent group flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                    isSelected ? "bg-primary/10 border-primary" : "bg-background"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      isSelected ? "bg-primary/20" : "bg-muted"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium leading-tight ${
                        isSelected ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {theme.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  if (!mounted) {
    const containerClass =
      variant === "mobile"
        ? "grid grid-cols-2 gap-4"
        : "flex flex-wrap items-center justify-center gap-2";

    return (
      <div className={containerClass}>
        {THEME_OPTIONS.map((t) => {
          const Icon = t.icon;
          return (
            <ActionButton
              key={t.value}
              variant="outline"
              size="sm"
              disabled
              icon={<Icon className="h-4 w-4 shrink-0" />}
              className={
                variant === "mobile"
                  ? "h-auto min-h-[2.75rem] w-full justify-start whitespace-normal py-2.5 text-left text-sm leading-tight"
                  : "text-sm"
              }
            >
              {t.label}
            </ActionButton>
          );
        })}
      </div>
    );
  }

  // Desktop hybrid: Show first 4 themes + "+X More" button for rest
  if (variant === "desktop") {
    const visibleThemes = THEME_OPTIONS.slice(0, DESKTOP_VISIBLE_THEMES);
    const hiddenThemes = THEME_OPTIONS.slice(DESKTOP_VISIBLE_THEMES);
    const hasMoreThemes = hiddenThemes.length > 0;

    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        {visibleThemes.map((t) => {
          const Icon = t.icon;
          return (
            <ActionButton
              key={t.value}
              variant={storeTheme === t.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleThemeChange(t.value)}
              icon={<Icon className="h-4 w-4" />}
              className="text-sm"
            >
              {t.label}
            </ActionButton>
          );
        })}

        {hasMoreThemes && (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-sm">
                More
                <ChevronDown className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-4" align="center">
              <div className="mb-3">
                <h4 className="text-foreground text-sm font-semibold">More Themes</h4>
              </div>
              <div className="space-y-2">
                {hiddenThemes.map((theme) => {
                  const Icon = theme.icon;
                  const isSelected = storeTheme === theme.value;
                  return (
                    <button
                      key={theme.value}
                      onClick={() => handleThemeChange(theme.value)}
                      className={`border-border hover:bg-accent flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                        isSelected ? "bg-primary/10 border-primary" : "bg-background"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                          isSelected ? "bg-primary/20" : "bg-muted"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`truncate text-sm font-medium ${
                            isSelected ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {theme.label}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    );
  }

  // Mobile variant
  const containerClass = "grid grid-cols-2 gap-4";

  return (
    <div className={containerClass}>
      {THEME_OPTIONS.map((t) => {
        const Icon = t.icon;
        return (
          <ActionButton
            key={t.value}
            variant={storeTheme === t.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleThemeChange(t.value)}
            icon={<Icon className="h-4 w-4 shrink-0" />}
            className="h-auto min-h-[2.75rem] w-full justify-start whitespace-normal py-2.5 text-left text-sm leading-tight"
          >
            {t.label}
          </ActionButton>
        );
      })}
    </div>
  );
}

