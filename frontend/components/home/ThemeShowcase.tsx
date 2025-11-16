"use client";

import { useIntersectionObserver } from "@/hooks/styling/useIntersectionObserver";
import { THEME_SHOWCASE_DATA } from "@/constants/theme-showcase";
import ThemeCard from "./ThemeCard";

export default function ThemeShowcase() {
  const { elementRef, isVisible } = useIntersectionObserver();

  return (
    <section
      id="themes"
      ref={elementRef}
      className="relative overflow-hidden py-16"
    >
      <div className="relative container mx-auto px-4">
        {/* Section header */}
        <div className="mb-12 text-center">
          <div
            className={`transition-all duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            }`}
          >
            <h2 className="text-foreground mb-4 text-4xl font-bold md:text-5xl">
              Five Unique Worlds
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Each theme creates a completely different experience with its own
              aesthetic, narrative style, and storytelling possibilities
            </p>
          </div>
        </div>

        {/* Theme grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {THEME_SHOWCASE_DATA.map((theme, index) => {
            const isLastOdd =
              THEME_SHOWCASE_DATA.length % 2 !== 0 &&
              index === THEME_SHOWCASE_DATA.length - 1;

            return (
              <ThemeCard
                key={theme.slug}
                {...theme}
                index={index}
                isVisible={isVisible}
                isLastOdd={isLastOdd}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
