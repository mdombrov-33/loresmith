"use client";

import HowItWorksCard from "@/components/home/HowItWorksCard";
import { useIntersectionObserver } from "@/hooks/styling/useIntersectionObserver";
import { Sparkles, ArrowRight } from "lucide-react";

export default function HowItWorks() {
  const { elementRef, isVisible } = useIntersectionObserver();

  return (
    <section ref={elementRef} className="relative overflow-hidden py-24">
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div
            className={`transition-all duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <div className="mb-4 flex items-center justify-center gap-2">
              <Sparkles className="text-primary h-6 w-6" />
              <h2 className="text-foreground text-4xl font-bold md:text-5xl">
                Your Journey Begins Here
              </h2>
              <Sparkles className="text-primary h-6 w-6" />
            </div>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              From idea to epic adventure in three simple steps
            </p>
          </div>
        </div>

        {/* Timeline Container */}
        <div className="relative mx-auto max-w-6xl">
          {/* Desktop: Horizontal connecting line */}
          <div className="absolute top-24 right-0 left-0 hidden h-0.5 md:block">
            <div
              className={`from-primary via-secondary to-primary h-full bg-gradient-to-r transition-all duration-[1500ms] ${
                isVisible ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
              }`}
              style={{ transformOrigin: "left" }}
            />
          </div>

          {/* Mobile: Vertical connecting line */}
          <div className="absolute top-0 bottom-0 left-10 w-0.5 md:hidden">
            <div
              className={`from-primary via-secondary to-primary h-full bg-gradient-to-b transition-all duration-[1500ms] ${
                isVisible ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
              }`}
              style={{ transformOrigin: "top" }}
            />
          </div>

          {/* Steps Grid */}
          <div className="grid gap-16 md:grid-cols-3 md:gap-8">
            <HowItWorksCard
              step={1}
              title="Generate a World"
              description="Choose a theme, set the tone, and let our AI craft a unique world filled with lore, locations, and quests"
              colorClass="primary"
              delay={200}
            />
            <HowItWorksCard
              step={2}
              title="Assemble Your Party"
              description="Create and customize your adventuring party with diverse characters, each with their own skills and backstories"
              colorClass="secondary"
              delay={400}
            />
            <HowItWorksCard
              step={3}
              title="Embark on Your Adventure"
              description="Dive into an interactive story where your choices shape the narrative and lead to epic outcomes"
              colorClass="accent"
              delay={600}
            />
          </div>

          {/* Connecting arrows (desktop only) */}
          <div className="absolute top-24 left-[calc(33.33%-1.5rem)] hidden md:block">
            <div
              className={`text-primary/50 transition-all delay-500 duration-700 ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-4 opacity-0"
              }`}
            >
              <ArrowRight className="h-6 w-6" />
            </div>
          </div>
          <div className="absolute top-24 left-[calc(66.66%-1.5rem)] hidden md:block">
            <div
              className={`text-secondary/50 transition-all delay-700 duration-700 ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-4 opacity-0"
              }`}
            >
              <ArrowRight className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
