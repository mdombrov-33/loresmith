"use client";

import { useRouter } from "next/navigation";
import ActionButton from "@/components/shared/ActionButton";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { useSession } from "next-auth/react";
import { Sparkles } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/styling/useIntersectionObserver";

export default function CTA() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme") || "fantasy";
  const { user, token, setIsLoginModalOpen } = useAppStore();
  const { data: session } = useSession();
  const { elementRef, isVisible } = useIntersectionObserver();

  const isAuthenticated = !!session || (!!user && !!token);

  const handleStartCreating = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setIsLoginModalOpen(true);
    } else {
      router.push(`/generate?theme=${theme}`);
    }
  };

  return (
    <section ref={elementRef} className="container mx-auto px-4 py-16 pb-24">
      <div
        className={`border-border bg-card/50 relative overflow-hidden rounded-3xl border backdrop-blur-sm transition-all duration-1000 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
      >
        {/* Subtle background gradient */}
        <div className="absolute inset-0">
          <div className="bg-primary/5 absolute -top-40 -right-40 h-96 w-96 rounded-full blur-3xl" />
          <div className="bg-primary/5 absolute -bottom-40 -left-40 h-96 w-96 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8 px-8 py-16 text-center md:px-16 md:py-20">
          {/* Heading */}
          <h2 className="from-foreground to-foreground/70 max-w-4xl bg-gradient-to-br bg-clip-text text-4xl font-bold leading-tight text-transparent md:text-6xl">
            Ready to craft your legend?
          </h2>

          {/* Subtext */}
          <p className="text-muted-foreground max-w-2xl text-xl leading-relaxed">
            Start building worlds, creating characters, and playing epic
            adventures. No credit card required.
          </p>

          {/* Single CTA */}
          <ActionButton
            variant="default"
            size="lg"
            className="group bg-primary text-primary-foreground hover:shadow-primary/50 relative overflow-hidden rounded-xl px-12 py-6 text-xl font-bold shadow-2xl transition-all hover:scale-105"
            onClick={handleStartCreating}
          >
            <span className="relative z-10 flex items-center gap-3">
              <Sparkles className="h-6 w-6" />
              Get Started Free
              <span className="inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
            <div className="bg-primary-foreground/20 absolute inset-0 -translate-x-full transition-transform duration-300 group-hover:translate-x-0" />
          </ActionButton>
        </div>
      </div>
    </section>
  );
}
