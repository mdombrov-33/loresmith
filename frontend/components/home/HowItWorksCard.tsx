"use client";

import { useIntersectionObserver } from "@/hooks/styling/useIntersectionObserver";

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

  return (
    <article
      ref={elementRef}
      className={`flex flex-col items-center text-center transition-all duration-700 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      {/* Animated step number */}
      <div className="relative mb-6">
        <div
          className={`bg-${colorClass}/10 text-${colorClass} flex h-20 w-20 items-center justify-center rounded-full border-2 border-${colorClass}/20 text-3xl font-bold backdrop-blur-sm transition-all hover:scale-110 hover:shadow-lg`}
        >
          {step}
        </div>
        {/* Pulsing ring */}
        <div
          className={`bg-${colorClass}/20 absolute inset-0 animate-ping rounded-full opacity-75`}
        />
        <div
          className={`bg-${colorClass}/10 absolute inset-2 animate-pulse rounded-full`}
        />
      </div>

      <h3 className="text-foreground mb-4 text-2xl font-bold">{title}</h3>
      <p className="text-muted-foreground max-w-sm leading-relaxed">
        {description}
      </p>

      {/* Connecting line for desktop */}
      {step < 3 && (
        <div className="border-border absolute top-10 left-full hidden h-0.5 w-12 border-t md:block" />
      )}
    </article>
  );
}
