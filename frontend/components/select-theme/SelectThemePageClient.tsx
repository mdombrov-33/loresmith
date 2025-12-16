"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { THEME_OPTIONS } from "@/constants/game-themes";
import { useEffect } from "react";
import { useParticleAnimation } from "@/hooks/styling/useParticleAnimation";
import MobileThemeSelector from "./MobileThemeSelector";
import DesktopThemeSidebar from "./DesktopThemeSidebar";
import ThemePreview from "./ThemePreview";

export default function SelectThemePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedThemeParam = searchParams.get("theme") || "fantasy";
  const { setTheme, setAppStage } = useAppStore();

  useEffect(() => {
    setAppStage("select-theme");
  }, [setAppStage]);

  const handleThemeSelect = (themeValue: string) => {
    router.push(`/select-theme?theme=${themeValue}`, { scroll: false });
  };

  const handleContinue = () => {
    if (!selectedThemeParam) return;
    setTheme(selectedThemeParam);
    router.push(`/generate?theme=${selectedThemeParam}`);
  };

  const ParticlesComponent = useParticleAnimation({
    theme: selectedThemeParam,
  });

  const selectedTheme = THEME_OPTIONS.find(
    (t) => t.value === selectedThemeParam,
  );

  return (
    <main className="bg-background flex min-h-screen flex-col overflow-hidden lg:flex-row">
      {/* MOBILE - Horizontal Theme Selector */}
      <MobileThemeSelector
        selectedTheme={selectedThemeParam}
        onThemeSelect={handleThemeSelect}
      />

      {/* DESKTOP - Left Sidebar */}
      <DesktopThemeSidebar
        selectedTheme={selectedThemeParam}
        onThemeSelect={handleThemeSelect}
      />

      {/* RIGHT SIDE - Immersive Preview */}
      <ThemePreview
        selectedTheme={selectedThemeParam}
        selectedThemeLabel={selectedTheme?.label || "Fantasy"}
        particles={ParticlesComponent}
        onContinue={handleContinue}
      />
    </main>
  );
}
