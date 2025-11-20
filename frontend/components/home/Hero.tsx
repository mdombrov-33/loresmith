"use client";

import { useRouter } from "next/navigation";
import ActionButton from "@/components/shared/ActionButton";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { useSession } from "next-auth/react";
import { Sparkles } from "lucide-react";
import { useParticleAnimation } from "@/hooks/styling/useParticleAnimation";
import Logo from "@/components/shared/Logo";

export default function Hero() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme") || "fantasy";
  const { user, token, setIsLoginModalOpen } = useAppStore();
  const { data: session } = useSession();
  const ParticlesComponent = useParticleAnimation({ theme });

  const isAuthenticated = !!session || (!!user && !!token);

  // Map theme to background image
  const getBackgroundImage = (currentTheme: string) => {
    const backgrounds: Record<string, string> = {
      fantasy: "/images/backgrounds/fantasy.png",
      "norse-mythology": "/images/backgrounds/norse-mythology.png",
      cyberpunk: "/images/backgrounds/cyberpunk.png",
      "post-apocalyptic": "/images/backgrounds/post-apocalypse.png",
      steampunk: "/images/backgrounds/steampunk.png",
    };
    return backgrounds[currentTheme] || backgrounds.fantasy;
  };

  const handleBeginAdventure = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setIsLoginModalOpen(true);
    } else {
      router.push(`/generate?theme=${theme}`);
    }
  };

  const handleLearnMore = () => {
    const themesSection = document.getElementById("themes");
    themesSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="relative min-h-[90vh] overflow-hidden">
      {/* Theme background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40 transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url('${getBackgroundImage(theme)}')` }}
      />

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {ParticlesComponent}
      </div>

      {/* Gradient overlays */}
      <div className="via-background/50 to-background absolute inset-0 bg-gradient-to-b from-transparent" />

      <section className="relative container mx-auto px-4 py-24 md:py-32">
        <div className="flex flex-col items-center justify-center gap-10 text-center">
          {/* Logo - simplified */}
          <div className="animate-fade-in">
            <Logo size="lg" showTagline />
          </div>

          {/* Main Heading - stronger, more direct */}
          <h1 className="animate-fade-in-delay from-foreground to-foreground/80 max-w-5xl bg-gradient-to-br bg-clip-text text-5xl font-bold leading-tight tracking-tight text-transparent md:text-7xl">
            Your Story. Your World.
            <br />
            <span className="text-primary">Infinite Possibilities.</span>
          </h1>

          {/* Subheading - simpler, more direct */}
          <p className="text-muted-foreground animate-fade-in-delay max-w-2xl text-xl leading-relaxed md:text-2xl">
            Generate entire worlds with AI. Build your party. Embark on
            adventures that adapt to every choice you make.
          </p>

          {/* Single primary CTA */}
          <div className="animate-fade-in-delay-2 mt-6">
            <ActionButton
              variant="default"
              size="lg"
              className="group bg-primary text-primary-foreground hover:shadow-primary/50 relative overflow-hidden rounded-xl px-12 py-6 text-xl font-bold shadow-2xl transition-all hover:scale-105"
              onClick={handleBeginAdventure}
            >
              <span className="relative z-10 flex items-center gap-3">
                <Sparkles className="h-6 w-6" />
                Start Creating
                <span className="inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
              <div className="bg-primary-foreground/20 absolute inset-0 -translate-x-full transition-transform duration-300 group-hover:translate-x-0" />
            </ActionButton>
          </div>

          {/* Simple theme indicator */}
          <div className="text-muted-foreground/60 animate-fade-in-delay-3 mt-8 text-sm">
            5 unique themes · Unlimited worlds · Free to start
          </div>
        </div>
      </section>

      {/* Bottom fade */}
      <div className="from-background absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent" />
    </header>
  );
}
