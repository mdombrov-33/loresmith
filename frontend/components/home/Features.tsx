"use client";

import FeatureCard from "@/components/home/FeatureCard";
import { Globe, Users, Map, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Features() {
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
    <section
      id="features"
      ref={sectionRef}
      className="relative overflow-hidden py-24"
    >
      <div className="relative container mx-auto px-4">
        {/* Section header */}
        <div className="mb-16 text-center">
          <div
            className={`transition-all duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <h2 className="text-foreground mb-4 text-4xl font-bold md:text-5xl">
              Powerful Features for Epic Storytelling
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Everything you need to create immersive worlds and unforgettable
              adventures
            </p>
          </div>
        </div>

        {/* Features grid */}
        <div
          className={`grid gap-8 transition-all delay-300 duration-700 md:grid-cols-2 lg:grid-cols-4 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* World Generation */}
          <FeatureCard
            icon={<Globe className="h-7 w-7" />}
            title="World Generation"
            description="Create rich lore and compelling narratives with AI-powered world building"
            colorClass="primary"
            delay={0}
          />

          {/* Party Management */}
          <FeatureCard
            icon={<Users className="h-7 w-7" />}
            title="Party Management"
            description="Manage your adventuring party, track stats, and develop characters"
            colorClass="primary"
            delay={100}
          />

          {/* Interactive Adventure */}
          <FeatureCard
            icon={<Map className="h-7 w-7" />}
            title="Interactive Adventure"
            description="Make choices that shape your story with branching narratives"
            colorClass="primary"
            delay={200}
          />

          {/* Character Progression */}
          <FeatureCard
            icon={<TrendingUp className="h-7 w-7" />}
            title="Character Progression"
            description="Track health, stress, inventory and watch your heroes evolve"
            colorClass="primary"
            delay={300}
          />
        </div>
      </div>
    </section>
  );
}
