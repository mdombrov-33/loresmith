"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const themes = [
  { value: "theme-fantasy", label: "Fantasy", icon: "✨" },
  { value: "theme-norse", label: "Norse", icon: "⚔️" },
  { value: "theme-cyberpunk", label: "Cyberpunk", icon: "🤖" },
  { value: "theme-post-apocalyptic", label: "Post-Apoc", icon: "☢️" },
  { value: "theme-steampunk", label: "Steampunk", icon: "🛠️" },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {themes.map((t) => (
        <Button
          key={t.value}
          variant={theme === t.value ? "default" : "outline"}
          size="sm"
          onClick={() => setTheme(t.value)}
          className="text-sm"
        >
          <span className="mr-1">{t.icon}</span>
          {t.label}
        </Button>
      ))}
    </div>
  );
}
