"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { THEME_OPTIONS } from "@/constants/game-themes";
import BackButton from "@/components/shared/BackButton";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { LoginModal } from "@/components/navbar/LoginModal";
import { RegisterModal } from "@/components/navbar/RegisterModal";
import { useEffect, useState } from "react";
import ActionButton from "@/components/shared/ActionButton";

export default function SelectThemePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedThemeParam = searchParams.get("theme");
  const {
    setTheme,
    setAppStage,
    user,
    setIsLoginModalOpen,
    isLoginModalOpen,
    isRegisterModalOpen,
    setIsRegisterModalOpen,
  } = useAppStore();
  const isAuthenticated = !!user;

  // Set app stage
  useEffect(() => {
    setAppStage("home"); // Use "home" stage for theme selection
  }, [setAppStage]);

  const handleThemeSelect = (themeValue: string) => {
    // Just update URL with theme parameter
    router.push(`/select-theme?theme=${themeValue}`, { scroll: false });
  };

  const [hasClickedContinue, setHasClickedContinue] = useState(false);

  const handleContinue = () => {
    if (!selectedThemeParam) return;

    // Sync theme to store
    setTheme(selectedThemeParam);

    // Navigate to generate page with selected theme
    if (!isAuthenticated) {
      // If not authenticated, show login modal first
      setHasClickedContinue(true);
      setIsLoginModalOpen(true);
    } else {
      router.push(`/generate?theme=${selectedThemeParam}`);
    }
  };

  // Auto-navigate to generate after login ONLY if user clicked Continue
  useEffect(() => {
    if (isAuthenticated && hasClickedContinue && selectedThemeParam && selectedThemeParam !== "default") {
      // Small delay to ensure state is updated
      const timer = setTimeout(() => {
        setTheme(selectedThemeParam);
        router.push(`/generate?theme=${selectedThemeParam}`);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, hasClickedContinue, selectedThemeParam, router, setTheme]);

  return (
    <main className="bg-background min-h-screen">
      {/* Header */}
      <div className="border-b bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full backdrop-blur">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <BackButton href="/my-worlds" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="mx-auto max-w-4xl">
          {/* Heading */}
          <div className="mb-12 text-center">
            <h1 className="from-foreground to-foreground/80 mb-4 bg-gradient-to-br bg-clip-text text-4xl font-bold leading-tight tracking-tight text-transparent md:text-5xl">
              Choose Your World
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
              Select a theme to begin your adventure. Each theme offers unique worlds, stories, and experiences.
            </p>
          </div>

          {/* Theme Grid */}
          <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {THEME_OPTIONS.map((theme) => {
              const Icon = theme.icon;
              const isSelected = selectedThemeParam === theme.value;
              return (
                <button
                  key={theme.value}
                  onClick={() => handleThemeSelect(theme.value)}
                  className={`group relative overflow-hidden rounded-xl border p-6 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                      : "border-border bg-card hover:border-primary hover:shadow-lg hover:shadow-primary/10"
                  }`}
                >
                  {/* Hover gradient overlay */}
                  {!isSelected && (
                    <div className="bg-primary/5 absolute inset-0 -translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
                  )}

                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 rounded-full bg-primary p-1">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="relative z-10">
                    <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${
                      isSelected ? "bg-primary/20" : "bg-primary/10 group-hover:bg-primary/20"
                    }`}>
                      <Icon className="text-primary h-6 w-6" />
                    </div>
                    <h3 className="text-foreground mb-2 text-xl font-semibold">{theme.label}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {theme.value === "fantasy" &&
                        "Epic quests, magical realms, and legendary heroes await in this classic fantasy setting."}
                      {theme.value === "norse-mythology" &&
                        "Viking sagas, ancient gods, and the harsh beauty of the Norse world."}
                      {theme.value === "cyberpunk" &&
                        "Neon-lit streets, corporate dystopias, and high-tech low-life adventures."}
                      {theme.value === "post-apocalyptic" &&
                        "Survive in a world reclaimed by nature, where humanity fights to rebuild."}
                      {theme.value === "steampunk" &&
                        "Victorian-era technology, steam-powered machines, and industrial revolution mysteries."}
                    </p>
                  </div>

                  {/* Arrow indicator (only on hover for unselected) */}
                  {!isSelected && (
                    <div className="text-primary absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                      <Sparkles className="h-5 w-5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Continue Button */}
          {selectedThemeParam && (
            <div className="flex justify-center">
              <ActionButton
                onClick={handleContinue}
                size="lg"
                className="px-8 py-3 text-lg font-semibold"
              >
                Continue
                <ArrowRight className="h-5 w-5" />
              </ActionButton>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </main>
  );
}

