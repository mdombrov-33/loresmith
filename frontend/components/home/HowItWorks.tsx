"use client";

import HowItWorksCard from "@/components/home/HowItWorksCard";
import { useEffect, useRef, useState } from "react";

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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
    <section ref={sectionRef} className="relative overflow-hidden py-24">
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
        <div className="mb-16 text-center">
          <div
            className={`transition-all duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <h2 className="text-foreground mb-4 text-4xl font-bold md:text-5xl">
              How It Works
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              From idea to adventure in three simple steps
            </p>
          </div>
        </div>

        <div
          className={`grid gap-12 transition-all delay-300 duration-700 md:grid-cols-3 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <HowItWorksCard
            step={1}
            title="Generate a World"
            description="Choose a theme, set the tone, and let our AI craft a unique world filled with lore, locations, and quests"
            colorClass="primary"
            delay={0}
          />
          <HowItWorksCard
            step={2}
            title="Assemble Your Party"
            description="Create and customize your adventuring party with diverse characters, each with their own skills and backstories"
            colorClass="secondary"
            delay={200}
          />
          <HowItWorksCard
            step={3}
            title="Embark on Your Adventure"
            description="Dive into an interactive story where your choices shape the narrative and lead to epic outcomes"
            colorClass="primary"
            delay={400}
          />
        </div>
      </div>
    </section>
  );
}
