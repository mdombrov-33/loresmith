"use client";

import { useRouter } from "next/navigation";
import ActionButton from "@/components/shared/ActionButton";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Sparkles, ArrowRight, Zap, Users, Trophy } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/styling/useIntersectionObserver";

export default function CTA() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme") || "fantasy";
  const { user, token, setIsLoginModalOpen } = useAppStore();
  const { data: session } = useSession();
  const { elementRef, isVisible } = useIntersectionObserver();

  const isAuthenticated = !!session || (!!user && !!token);

  return (
    <section ref={elementRef} className="container mx-auto px-4 py-24">
      <div
        className={`border-border bg-card relative overflow-hidden rounded-3xl border shadow-2xl transition-all duration-1000 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
      >
        {/* Animated background orbs */}
        <div className="absolute inset-0">
          <div className="bg-primary/10 absolute -top-40 -right-40 h-96 w-96 animate-pulse rounded-full blur-3xl" />
          <div className="bg-secondary/10 absolute -bottom-40 -left-40 h-96 w-96 animate-pulse rounded-full blur-3xl delay-1000" />
          <div className="bg-accent/10 absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full blur-3xl delay-500" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-8 p-12 text-center md:p-20">
          {/* Animated Icon */}
          <div
            className={`transition-all delay-200 duration-700 ${
              isVisible ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
          >
            <div className="bg-primary/10 border-primary relative flex h-24 w-24 items-center justify-center rounded-2xl border-2 backdrop-blur-sm">
              <Sparkles className="text-primary h-12 w-12 animate-pulse" />
              <div className="bg-primary/20 absolute -inset-6 animate-pulse rounded-3xl blur-2xl" />
            </div>
          </div>

          {/* Heading */}
          <h2
            className={`from-foreground to-muted-foreground max-w-3xl bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent transition-all delay-300 duration-700 md:text-5xl ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            Ready to Build Epic Worlds?
          </h2>

          {/* Description */}
          <p
            className={`text-muted-foreground max-w-2xl text-lg leading-relaxed transition-all delay-400 duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            Join thousands of storytellers and adventurers creating legendary
            narratives with AI. Every world is unique, every adventure is yours
            to command.
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col gap-4 transition-all delay-500 duration-700 sm:flex-row ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <ActionButton
              variant="default"
              size="lg"
              className="group bg-primary text-primary-foreground hover:shadow-primary/50 relative overflow-hidden rounded-lg px-8 py-4 text-lg font-semibold shadow-2xl transition-all hover:scale-105"
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
                <Zap className="h-5 w-5" />
                Start Creating Now
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="bg-primary-foreground/10 absolute inset-0 -translate-x-full transition-transform duration-300 group-hover:translate-x-0" />
            </ActionButton>

            <ActionButton
              variant="outline"
              size="lg"
              className="group rounded-lg px-8 py-4 text-lg font-semibold transition-all hover:scale-105"
              onClick={() => router.push("/search")}
            >
              <span className="flex items-center gap-2">
                Explore Worlds
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </ActionButton>
          </div>

          {/* Feature Pills */}
          <div
            className={`mt-8 flex flex-wrap items-center justify-center gap-4 transition-all delay-700 duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <div className="bg-primary/10 border-primary/20 flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-sm">
              <Zap className="text-primary h-4 w-4" />
              <span className="text-foreground text-sm font-medium">
                Instant Generation
              </span>
            </div>
            <div className="bg-secondary/10 border-secondary/20 flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-sm">
              <Users className="text-secondary h-4 w-4" />
              <span className="text-foreground text-sm font-medium">
                1000+ Active Players
              </span>
            </div>
            <div className="bg-accent/10 border-accent/20 flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-sm">
              <Trophy className="text-accent h-4 w-4" />
              <span className="text-foreground text-sm font-medium">
                Award-Winning Stories
              </span>
            </div>
          </div>

          {/* Trust Badges */}
          <div
            className={`border-border bg-background/50 mt-8 grid grid-cols-1 gap-6 rounded-xl border px-8 py-6 backdrop-blur-sm transition-all delay-900 duration-700 sm:grid-cols-3 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="bg-primary/20 flex h-12 w-12 items-center justify-center rounded-xl">
                <span className="text-primary text-xl font-bold">✓</span>
              </div>
              <div>
                <div className="text-foreground font-semibold">
                  Free to Start
                </div>
                <div className="text-muted-foreground text-xs">
                  No credit card required
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <div className="bg-primary/20 flex h-12 w-12 items-center justify-center rounded-xl">
                <span className="text-primary text-xl font-bold">∞</span>
              </div>
              <div>
                <div className="text-foreground font-semibold">
                  Unlimited Worlds
                </div>
                <div className="text-muted-foreground text-xs">
                  Create as many as you want
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <div className="bg-primary/20 flex h-12 w-12 items-center justify-center rounded-xl">
                <span className="text-primary text-xl font-bold">⚡</span>
              </div>
              <div>
                <div className="text-foreground font-semibold">AI-Powered</div>
                <div className="text-muted-foreground text-xs">
                  Cutting-edge technology
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
