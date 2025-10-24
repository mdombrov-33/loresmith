"use client";

import { useIntersectionObserver } from "@/hooks/styling/useIntersectionObserver";
import { useState } from "react";

interface HowItWorksCardProps {
  step: number;
  title: string;
  description: string;
  colorClass: "primary" | "secondary" | "accent";
  delay?: number;
}

export default function HowItWorksCard({
  step,
  title,
  description,
  colorClass,
  delay = 0,
}: HowItWorksCardProps) {
  const { elementRef, isVisible } = useIntersectionObserver({}, delay);
  const [isHovered, setIsHovered] = useState(false);

  const colorVariants = {
    primary: {
      bg: "bg-primary",
      text: "text-primary-foreground",
      border: "border-primary",
      glow: "shadow-primary/30",
    },
    secondary: {
      bg: "bg-secondary",
      text: "text-secondary-foreground",
      border: "border-secondary",
      glow: "shadow-secondary/30",
    },
    accent: {
      bg: "bg-accent",
      text: "text-accent-foreground",
      border: "border-accent",
      glow: "shadow-accent/30",
    },
  };

  const variant = colorVariants[colorClass];

  return (
    <article
      ref={elementRef}
      className={`flex flex-col items-center text-center transition-all duration-700 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Step Number Circle */}
      <div className="relative z-10 mb-8">
        {/* Outer animated rings */}
        <div
          className={`${variant.bg} absolute inset-0 animate-pulse rounded-full opacity-20 blur-2xl transition-all duration-500 ${
            isHovered ? "scale-150" : "scale-100"
          }`}
        />

        {/* Main circle with border */}
        <div
          className={`${variant.bg} ${variant.text} ${variant.border} relative flex h-20 w-20 items-center justify-center rounded-full border-2 text-3xl font-bold shadow-xl backdrop-blur-sm transition-all duration-300 ${
            isHovered ? `scale-110 ${variant.glow} shadow-2xl` : "scale-100"
          }`}
        >
          <span className="relative z-10">{step}</span>

          {/* Spinning ring on hover */}
          {isHovered && (
            <>
              <div
                className={`${variant.border} absolute inset-0 animate-ping rounded-full border-4 opacity-75`}
              />
              <div
                className={`${variant.border} absolute -inset-2 animate-spin rounded-full border-2 opacity-50`}
                style={{ animationDuration: "3s" }}
              />
            </>
          )}
        </div>
      </div>

      {/* Content Card */}
      <div
        className={`bg-card/50 border-border group relative w-full rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
          isHovered ? "-translate-y-2 shadow-2xl" : "translate-y-0 shadow-lg"
        }`}
      >
        {/* Hover gradient overlay */}
        <div
          className={`${variant.bg} absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 ${
            isHovered ? "opacity-5" : "opacity-0"
          }`}
        />

        <div className="relative z-10 p-6">
          <h3
            className={`text-foreground mb-4 text-2xl font-bold transition-colors ${
              isHovered ? "text-primary" : ""
            }`}
          >
            {title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>

        {/* Bottom accent line */}
        <div
          className={`${variant.bg} absolute inset-x-0 bottom-0 h-1 rounded-b-2xl transition-all duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Corner decoration */}
        <div
          className={`${variant.bg} absolute -top-2 -right-2 h-4 w-4 rounded-full opacity-0 transition-all duration-300 ${
            isHovered ? "animate-ping opacity-50" : "opacity-0"
          }`}
        />
      </div>
    </article>
  );
}
