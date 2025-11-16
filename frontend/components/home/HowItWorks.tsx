"use client";

import { useIntersectionObserver } from "@/hooks/styling/useIntersectionObserver";
import { ArrowRight } from "lucide-react";

export default function HowItWorks() {
  const { elementRef, isVisible } = useIntersectionObserver();

  const steps = [
    {
      number: "01",
      title: "Choose Your Theme",
      description:
        "Select from five distinct worlds - each with its own visual style, narrative voice, and storytelling elements. Your theme choice sets the foundation for everything that follows.",
      details: "Themes: Fantasy · Norse Mythology · Cyberpunk · Steampunk · Post-Apocalyptic",
    },
    {
      number: "02",
      title: "Generate & Customize",
      description:
        "Our AI crafts a complete world: rich backstory, compelling characters, intricate factions, and story hooks. Then build your party - choose your protagonist and companions with unique abilities and flaws.",
      details: "Generated: World Lore · Characters · Factions · Story Hooks · Visual Portraits",
    },
    {
      number: "03",
      title: "Play Your Story",
      description:
        "Embark on an interactive narrative where every choice matters. Face moral dilemmas, manage your party's health and stress, make strategic decisions, and shape the fate of your world.",
      details: "Features: Choice-driven narrative · Character progression · Consequence system",
    },
  ];

  return (
    <section ref={elementRef} className="relative overflow-hidden py-16">
      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
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
              From concept to adventure in minutes
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="mx-auto max-w-5xl">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`border-border bg-card/30 group relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-700 hover:border-primary/50 ${
                  isVisible
                    ? "translate-x-0 opacity-100"
                    : "translate-x-12 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:gap-8">
                  {/* Number */}
                  <div className="flex-shrink-0">
                    <div className="from-primary to-primary/50 bg-gradient-to-br bg-clip-text text-6xl font-bold text-transparent md:text-7xl">
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-foreground mb-3 text-2xl font-bold md:text-3xl">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 text-lg leading-relaxed">
                      {step.description}
                    </p>
                    <div className="bg-background/50 border-primary/20 rounded-lg border px-4 py-3">
                      <p className="text-primary/80 text-sm">{step.details}</p>
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                    <ArrowRight className="text-primary h-8 w-8" />
                  </div>
                </div>

                {/* Hover gradient effect */}
                <div className="from-primary/5 to-transparent absolute inset-0 translate-x-full bg-gradient-to-r transition-transform duration-500 group-hover:translate-x-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
