"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { THEME_OPTIONS } from "@/constants/game-themes";
import ActionButton from "@/components/shared/ActionButton";
import { useSession } from "next-auth/react";
import { ArrowLeft, Sparkles } from "lucide-react";
import Logo from "@/components/shared/Logo";
import { LoginModal } from "@/components/navbar/LoginModal";
import { RegisterModal } from "@/components/navbar/RegisterModal";
import { useEffect } from "react";

export default function SelectThemePage() {
  const router = useRouter();
  const {
    setTheme,
    setAppStage,
    user,
    token,
    setIsLoginModalOpen,
    isLoginModalOpen,
    isRegisterModalOpen,
    setIsRegisterModalOpen,
    theme: selectedTheme,
  } = useAppStore();
  const { data: session } = useSession();
  const isAuthenticated = !!session || (!!user && !!token);

  // Set app stage
  useEffect(() => {
    setAppStage("home"); // Use "home" stage for theme selection
  }, [setAppStage]);

  // Auto-navigate to generate after login if theme is selected
  useEffect(() => {
    if (isAuthenticated && selectedTheme && selectedTheme !== "default") {
      // Small delay to ensure state is updated
      const timer = setTimeout(() => {
        router.push(`/generate?theme=${selectedTheme}`);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, selectedTheme, router]);

  const handleThemeSelect = (themeValue: string) => {
    setTheme(themeValue);
    // Navigate to generate page with selected theme
    if (!isAuthenticated) {
      // If not authenticated, show login modal first
      setIsLoginModalOpen(true);
      // Store the selected theme so we can navigate after login
      // The generate page will handle this via the theme in the store
    } else {
      router.push(`/generate?theme=${themeValue}`);
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  return (
    <main className="bg-background min-h-screen">
      {/* Header */}
      <div className="border-b bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full backdrop-blur">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <ActionButton
            variant="ghost"
            size="sm"
            onClick={handleBack}
            icon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </ActionButton>
          <div className="flex-1" />
          <Logo size="sm" />
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
              return (
                <button
                  key={theme.value}
                  onClick={() => handleThemeSelect(theme.value)}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10"
                >
                  {/* Hover gradient overlay */}
                  <div className="bg-primary/5 absolute inset-0 -translate-y-full transition-transform duration-300 group-hover:translate-y-0" />

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="bg-primary/10 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg transition-colors group-hover:bg-primary/20">
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

                  {/* Arrow indicator */}
                  <div className="text-primary absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </button>
              );
            })}
          </div>
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

