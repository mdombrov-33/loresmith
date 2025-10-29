"use client";

import { useRouter } from "next/navigation";
import ActionButton from "@/components/shared/ActionButton";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { toast } from "sonner";
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

  const handleBeginAdventure = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast("Please login to start your adventure", {
        action: {
          label: "Login",
          onClick: () => setIsLoginModalOpen(true),
        },
      });
    } else {
      router.push(`/generate?theme=${theme}`);
    }
  };

  const handleLearnMore = () => {
    const featuresSection = document.getElementById("features");
    featuresSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="relative min-h-[90vh] overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {ParticlesComponent}
      </div>

      {/* Gradient overlays */}
      <div className="via-background/50 to-background absolute inset-0 bg-gradient-to-b from-transparent" />

      <section className="relative container mx-auto px-4 py-24 md:py-32">
        <div className="flex flex-col items-center justify-center gap-8 text-center">
          {/* Logo */}
          <div className="relative">
            <div className="bg-primary/5 border-primary/30 relative rounded-2xl border-2 px-8 py-4 backdrop-blur-sm">
              <Logo size="lg" showTagline />
              <div className="bg-primary/10 absolute -inset-4 -z-10 animate-pulse rounded-3xl blur-xl" />
            </div>
          </div>

          {/* Beta Badge */}
          <div className="border-border bg-card/80 animate-slide-up inline-flex items-center gap-2 rounded-full border px-4 py-2 shadow-lg backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span className="bg-primary relative inline-flex h-2 w-2 rounded-full" />
            </span>
            <span className="text-muted-foreground text-sm font-medium">
              Now in Open Beta
            </span>
          </div>

          {/* Main Heading with gradient */}
          <h1 className="animate-fade-in from-foreground to-muted-foreground max-w-5xl bg-gradient-to-br bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-7xl">
            Create & Play Epic Adventures
          </h1>

          {/* Subheading */}
          <p className="text-muted-foreground animate-fade-in-delay max-w-3xl text-xl leading-relaxed">
            Generate unique worlds, assemble your party, and embark on{" "}
            <span className="text-primary font-semibold">AI-driven</span>{" "}
            interactive adventures where every choice matters
          </p>

          {/* CTA Buttons Group */}
          <div className="animate-fade-in-delay-2 mt-4 flex flex-col gap-4 sm:flex-row">
            <ActionButton
              variant="default"
              size="lg"
              className="group bg-primary text-primary-foreground hover:shadow-primary/25 relative overflow-hidden rounded-lg px-8 py-4 text-lg font-semibold shadow-2xl transition-all hover:scale-105"
              onClick={handleBeginAdventure}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Begin Your Adventure
                <span className="inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
              <div className="bg-primary-foreground/10 absolute inset-0 -translate-x-full transition-transform group-hover:translate-x-0" />
            </ActionButton>

            <ActionButton
              variant="outline"
              size="lg"
              className="group rounded-lg px-8 py-4 text-lg font-semibold transition-all hover:scale-105"
              onClick={handleLearnMore}
            >
              <span className="flex items-center gap-2">
                Learn More
                <span className="inline-block transition-transform group-hover:translate-y-1">
                  ↓
                </span>
              </span>
            </ActionButton>
          </div>

          {/* Stats or social proof */}
          <div className="animate-fade-in-delay-3 border-border bg-card/50 mt-12 flex flex-wrap items-center justify-center gap-8 rounded-2xl border px-8 py-4 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-primary text-2xl font-bold">1000+</div>
              <div className="text-muted-foreground text-sm">
                Worlds Created
              </div>
            </div>
            <div className="border-border h-8 w-px border-l" />
            <div className="text-center">
              <div className="text-primary text-2xl font-bold">500+</div>
              <div className="text-muted-foreground text-sm">
                Active Players
              </div>
            </div>
            <div className="border-border h-8 w-px border-l" />
            <div className="text-center">
              <div className="text-primary text-2xl font-bold">5</div>
              <div className="text-muted-foreground text-sm">Unique Themes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom fade */}
      <div className="from-background absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent" />
    </header>
  );
}
