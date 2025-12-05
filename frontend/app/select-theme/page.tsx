"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { THEME_OPTIONS } from "@/constants/game-themes";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useParticleAnimation } from "@/hooks/styling/useParticleAnimation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export default function SelectThemePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedThemeParam = searchParams.get("theme") || "fantasy"; // Default to fantasy
  const { setTheme, setAudioTheme, setAppStage } = useAppStore();

  // Set app stage on mount
  useEffect(() => {
    setAppStage("home");
  }, [setAppStage]);

  const handleThemeSelect = (themeValue: string) => {
    setAudioTheme(themeValue); // Change music immediately
    router.push(`/select-theme?theme=${themeValue}`, { scroll: false });
  };

  const handleContinue = () => {
    if (!selectedThemeParam) return;
    setTheme(selectedThemeParam);
    router.push(`/generate?theme=${selectedThemeParam}`);
  };

  // Get particles for selected theme
  const ParticlesComponent = useParticleAnimation({
    theme: selectedThemeParam || "fantasy",
  });

  // Get selected theme object
  const selectedTheme = THEME_OPTIONS.find(
    (t) => t.value === selectedThemeParam,
  );

  // Theme descriptions
  const themeDescriptions: Record<
    string,
    { description: string; features: string[] }
  > = {
    fantasy: {
      description:
        "Epic quests, magical realms, and legendary heroes await in this classic fantasy setting.",
      features: [
        "Ancient magic systems",
        "Mythical creatures",
        "Heroic adventures",
        "Medieval kingdoms",
      ],
    },
    "norse-mythology": {
      description:
        "Viking sagas, ancient gods, and the harsh beauty of the Norse world.",
      features: [
        "Norse pantheon",
        "Viking warfare",
        "Runic magic",
        "Nine realms",
      ],
    },
    cyberpunk: {
      description:
        "Neon-lit streets, corporate dystopias, and high-tech low-life adventures.",
      features: [
        "Megacorporations",
        "Cybernetic enhancements",
        "Digital consciousness",
        "Urban sprawl",
      ],
    },
    "post-apocalyptic": {
      description:
        "Survive in a world reclaimed by nature, where humanity fights to rebuild.",
      features: [
        "Wasteland survival",
        "Mutated creatures",
        "Scavenging resources",
        "Faction warfare",
      ],
    },
    steampunk: {
      description:
        "Victorian-era technology, steam-powered machines, and industrial revolution mysteries.",
      features: [
        "Brass machinery",
        "Steam power",
        "Victorian society",
        "Airship travel",
      ],
    },
  };

  return (
    <main className="bg-background flex min-h-screen flex-col overflow-hidden lg:flex-row">
      {/* MOBILE - Horizontal Theme Selector (visible on mobile only) */}
      <div className="border-border bg-card/95 border-b px-4 py-4 backdrop-blur-sm lg:hidden">
        <h2 className="text-foreground mb-3 text-sm font-semibold">Select Theme</h2>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-primary/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          {THEME_OPTIONS.map((theme) => {
            const Icon = theme.icon;
            const isSelected = selectedThemeParam === theme.value;

            return (
              <button
                key={theme.value}
                onClick={() => handleThemeSelect(theme.value)}
                className={cn(
                  "flex flex-shrink-0 items-center gap-2 rounded-full border px-4 py-2 transition-all",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-lg"
                    : "border-border bg-card text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="whitespace-nowrap text-sm font-medium">
                  {theme.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DESKTOP - LEFT SIDEBAR - Theme Selection (hidden on mobile) */}
      <aside className="border-border bg-card/50 hidden h-screen w-80 flex-col border-r backdrop-blur-sm lg:flex">
        {/* Header */}
        <div className="border-border border-b p-6">
          <h1 className="font-heading mb-2 text-2xl font-bold">
            Choose Your World
          </h1>
          <p className="text-muted-foreground text-sm">
            Select a theme to begin your journey
          </p>
        </div>

        {/* Theme List */}
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {THEME_OPTIONS.map((theme) => {
            const Icon = theme.icon;
            const isSelected = selectedThemeParam === theme.value;

            return (
              <button
                key={theme.value}
                onClick={() => handleThemeSelect(theme.value)}
                className={cn(
                  "group relative w-full overflow-hidden rounded-lg border p-4 text-left transition-all duration-300",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-primary/20 scale-105 shadow-lg"
                    : "border-border bg-card hover:border-primary/50 hover:bg-card/80 hover:shadow-md",
                )}
              >
                {/* Subtle gradient shine on hover (non-selected) */}
                {!isSelected && (
                  <div className="via-primary/5 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                )}

                {/* Content */}
                <div className="relative z-10 flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                      isSelected
                        ? "bg-primary/20"
                        : "bg-primary/10 group-hover:bg-primary/15",
                    )}
                  >
                    <Icon className="text-primary h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground font-semibold">
                      {theme.label}
                    </h3>
                  </div>
                  {isSelected && (
                    <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full">
                      <Check className="text-primary-foreground h-4 w-4" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* RIGHT SIDE - Immersive Preview */}
      <main className="relative flex-1 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={`/images/backgrounds/${selectedThemeParam === "post-apocalyptic" ? "post-apocalypse" : selectedThemeParam}.png`}
            alt={selectedTheme?.label || "Theme background"}
            fill
            className="object-cover object-[50%_35%] transition-opacity duration-500 md:object-center"
            priority
          />
        </div>

        {/* Particles Overlay */}
        <div className="absolute inset-0 z-10">{ParticlesComponent}</div>

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/70 via-black/50 to-black/80 md:from-black/60 md:via-black/40 md:to-black/70" />

        {/* Spotlight effect */}
        <Spotlight
          className="-top-40 left-0 md:-top-20 md:left-60"
          fill="white"
        />

        {/* Content - Description Panel (Centered) */}
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 md:p-8 lg:p-12">
          <div className="w-full max-w-2xl">
            {/* Glass morphism card */}
            <div className="border-primary/20 bg-card/90 relative overflow-hidden rounded-2xl border p-6 shadow-2xl backdrop-blur-xl md:p-8">
              {/* Top gradient accent */}
              <div className="via-primary/50 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />

              {/* Content */}
              <div className="relative z-10">
                {/* Theme name with sparkle */}
                <div className="mb-3 flex items-center gap-2 md:mb-4 md:gap-3">
                  <Sparkles className="text-primary h-5 w-5 md:h-6 md:w-6" />
                  <h2 className="font-heading text-foreground text-2xl font-bold md:text-4xl lg:text-5xl">
                    {selectedTheme?.label}
                  </h2>
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed md:mb-6 md:text-lg">
                  {themeDescriptions[selectedThemeParam]?.description}
                </p>

                {/* Features */}
                <div className="mb-6 flex justify-center md:mb-8">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 md:gap-x-6 md:gap-y-3">
                    {themeDescriptions[selectedThemeParam]?.features.map(
                      (feature, idx) => (
                        <div
                          key={idx}
                          className="text-foreground/80 flex items-center gap-2 text-xs md:text-sm"
                        >
                          <div className="bg-primary h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                          <span>{feature}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Continue Button */}
                <div className="flex justify-center">
                  <ShimmerButton
                    onClick={handleContinue}
                    className="h-10 px-6 text-sm font-semibold md:h-12 md:px-8 md:text-base"
                    shimmerColor="hsl(var(--primary))"
                    background="hsl(var(--primary))"
                  >
                    <span className="flex items-center gap-2">
                      Continue to Generation
                      <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                    </span>
                  </ShimmerButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </main>
  );
}
