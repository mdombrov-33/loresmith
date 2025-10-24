"use client";

import { useRouter } from "next/navigation";
import ActionButton from "@/components/shared/ActionButton";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Sparkles, Swords } from "lucide-react";
import { useEffect, useRef } from "react";

export default function Hero() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme") || "fantasy";
  const { user, token, setIsLoginModalOpen } = useAppStore();
  const { data: session } = useSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isAuthenticated = !!session || (!!user && !!token);

  // Particle animation based on theme
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];

    // Theme-specific particle config
    const particleConfigs: Record<
      string,
      { count: number; color: string; speed: number }
    > = {
      fantasy: { count: 40, color: "rgba(255, 215, 0, 0.6)", speed: 0.3 },
      "norse-mythology": {
        count: 35,
        color: "rgba(100, 149, 237, 0.6)",
        speed: 0.4,
      },
      cyberpunk: { count: 50, color: "rgba(255, 0, 255, 0.7)", speed: 0.6 },
      "post-apocalyptic": {
        count: 30,
        color: "rgba(255, 140, 0, 0.5)",
        speed: 0.2,
      },
      steampunk: { count: 35, color: "rgba(205, 133, 63, 0.6)", speed: 0.35 },
    };

    const config = particleConfigs[theme] || particleConfigs.fantasy;

    // Initialize particles
    for (let i = 0; i < config.count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * config.speed,
        speedY: (Math.random() - 0.5) * config.speed,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        // Draw particle
        ctx.fillStyle = config.color.replace(
          "0.6",
          particle.opacity.toString(),
        );
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw connections
        particles.slice(index + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.strokeStyle = config.color.replace(
              "0.6",
              ((1 - distance / 120) * 0.15).toString(),
            );
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [theme]);

  return (
    <header className="relative min-h-[90vh] overflow-hidden">
      {/* Animated background canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-40"
        style={{ pointerEvents: "none" }}
      />

      {/* Gradient overlays */}
      <div className="via-background/50 to-background absolute inset-0 bg-gradient-to-b from-transparent" />

      <section className="relative container mx-auto px-4 py-24 md:py-32">
        <div className="flex flex-col items-center justify-center gap-8 text-center">
          {/* Floating icon */}
          <div className="relative">
            <div className="animate-float">
              <div className="bg-primary/10 border-primary relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 backdrop-blur-sm">
                <Swords className="text-primary h-12 w-12" />
                <div className="bg-primary/20 absolute -inset-4 -z-10 animate-pulse rounded-3xl blur-xl" />
              </div>
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
              onClick={(e) => {
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
              }}
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
              onClick={() => {
                const featuresSection = document.getElementById("features");
                featuresSection?.scrollIntoView({ behavior: "smooth" });
              }}
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
