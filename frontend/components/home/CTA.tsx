"use client";

import { useRouter } from "next/navigation";
import ActionButton from "@/components/shared/ActionButton";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Sparkles, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function CTA() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme") || "fantasy";
  const { user, token, setIsLoginModalOpen } = useAppStore();
  const { data: session } = useSession();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const isAuthenticated = !!session || (!!user && !!token);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="container mx-auto px-4 py-24">
      <div
        className={`border-border bg-card relative overflow-hidden rounded-3xl border shadow-2xl transition-all duration-1000 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
      >
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
          {/* Icon */}
          <div
            className={`transition-all delay-200 duration-700 ${
              isVisible ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
          >
            <div className="bg-primary/10 border-primary relative flex h-20 w-20 items-center justify-center rounded-2xl border-2 backdrop-blur-sm">
              <Sparkles className="text-primary h-10 w-10" />
              <div className="bg-primary/20 absolute -inset-4 animate-pulse rounded-3xl blur-2xl" />
            </div>
          </div>

          {/* Heading */}
          <h2
            className={`text-card-foreground max-w-3xl text-4xl font-bold transition-all delay-300 duration-700 md:text-5xl ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            Ready to Build Worlds?
          </h2>

          {/* Description */}
          <p
            className={`text-muted-foreground max-w-2xl text-lg leading-relaxed transition-all delay-400 duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            Join storytellers and adventurers creating epic narratives with AI.
            Every world is unique, every adventure is yours to shape.
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

          {/* Trust indicators */}
          <div
            className={`border-border bg-background/50 mt-8 flex flex-wrap items-center justify-center gap-6 rounded-xl border px-6 py-4 backdrop-blur-sm transition-all delay-700 duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg">
                <span className="text-primary text-sm font-bold">✓</span>
              </div>
              <span className="text-muted-foreground text-sm">
                Free to Start
              </span>
            </div>
            <div className="border-border h-6 w-px border-l" />
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg">
                <span className="text-primary text-sm font-bold">✓</span>
              </div>
              <span className="text-muted-foreground text-sm">
                No Credit Card
              </span>
            </div>
            <div className="border-border h-6 w-px border-l" />
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg">
                <span className="text-primary text-sm font-bold">✓</span>
              </div>
              <span className="text-muted-foreground text-sm">
                Unlimited Creativity
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
