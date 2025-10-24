"use client";

import { useEffect, useRef, useState } from "react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  colorClass: "primary" | "secondary" | "accent";
  delay?: number;
}

export default function FeatureCard({
  icon,
  title,
  description,
  colorClass,
  delay = 0,
}: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 },
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <article
      ref={cardRef}
      className={`group border-border bg-card/50 hover:bg-card hover:shadow-primary/10 relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-500 hover:shadow-2xl ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      {/* Animated background glow */}
      <div
        className={`bg-${colorClass}/5 absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100`}
      />

      {/* Floating particles effect */}
      <div className="bg-primary/20 absolute -top-2 -right-2 h-4 w-4 animate-ping rounded-full opacity-0 group-hover:opacity-100" />
      <div className="bg-secondary/20 absolute -bottom-2 -left-2 h-3 w-3 animate-pulse rounded-full opacity-0 delay-300 group-hover:opacity-100" />

      <div className="relative z-10 flex flex-col items-center p-8 text-center">
        <div
          className={`bg-${colorClass}/10 text-${colorClass} mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-${colorClass}/20 backdrop-blur-sm transition-all group-hover:scale-110 group-hover:shadow-lg`}
        >
          {icon}
        </div>
        <h3 className="text-card-foreground group-hover:text-primary mb-3 text-xl font-bold transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground group-hover:text-foreground/80 leading-relaxed transition-colors">
          {description}
        </p>
      </div>
    </article>
  );
}
