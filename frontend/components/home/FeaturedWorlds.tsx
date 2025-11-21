"use client";

import { useState } from "react";
import { useIntersectionObserver } from "@/hooks/styling/useIntersectionObserver";
import { useWorlds } from "@/lib/queries/world";
import { World } from "@/lib/schemas/index";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import CardImage from "@/components/shared/card/CardImage";

export default function FeaturedWorlds() {
  const { elementRef, isVisible } = useIntersectionObserver();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data, isLoading, error } = useWorlds({
    scope: "global",
    limit: 6,
  });

  const worlds = data?.worlds || [];

  // Debug logging
  if (error) {
    console.error("FeaturedWorlds error:", error);
  }
  if (!isLoading && data) {
    console.log("FeaturedWorlds data:", worlds.length, "worlds");
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(worlds.length - 2, 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(worlds.length - 3, 0) : prev - 1
    );
  };

  const getCharacterFromWorld = (world: World) => {
    return world.lore_pieces?.find((piece) => piece.type === "character");
  };

  const getStoryContent = (world: World): string => {
    try {
      const parsed = JSON.parse(world.full_story);
      return parsed.content || "";
    } catch {
      return "";
    }
  };

  if (isLoading) {
    return (
      <section className="relative overflow-hidden py-16">
        <div className="relative container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-foreground mb-4 text-4xl font-bold md:text-5xl">
              Featured Worlds
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Discover worlds created by our community
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </div>
      </section>
    );
  }

  if (worlds.length === 0) {
    return null;
  }

  return (
    <section
      id="featured"
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
              Featured Worlds
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Explore rich narratives crafted across different themes and genres
            </p>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative mx-auto max-w-7xl">
          <div
            className={`transition-all duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            {/* Navigation Buttons */}
            {worlds.length > 3 && (
              <>
                <button
                  onClick={prevSlide}
                  className="bg-card/80 border-border hover:bg-card absolute -left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border p-2 backdrop-blur-sm transition-all hover:scale-110 disabled:opacity-50"
                  disabled={currentIndex === 0}
                  aria-label="Previous worlds"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="bg-card/80 border-border hover:bg-card absolute -right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border p-2 backdrop-blur-sm transition-all hover:scale-110 disabled:opacity-50"
                  disabled={currentIndex >= worlds.length - 3}
                  aria-label="Next worlds"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* World Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {worlds.slice(currentIndex, currentIndex + 3).map((world) => {
                const character = getCharacterFromWorld(world);
                const portraitUrl = world.portrait_url || character?.details?.portrait_url;

                return (
                  <Link
                    key={world.id}
                    href={`/worlds/${world.theme}/${world.id}`}
                    className="group"
                  >
                    <div className="border-border bg-card/50 hover:bg-card overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl">
                      {/* Portrait */}
                      {portraitUrl && (
                        <div className="relative h-48 overflow-hidden">
                          <CardImage
                            src={portraitUrl}
                            alt={character?.name || "World character"}
                            objectFit="cover"
                            height="h-48"
                            className="transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-6">
                        {/* Theme Badge */}
                        <div className="mb-3 flex items-center justify-between">
                          <span className="bg-primary/10 text-primary border-primary/20 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                            {world.theme}
                          </span>
                          <Sparkles className="text-primary h-4 w-4" />
                        </div>

                        {/* Character Name */}
                        {character && (
                          <h3 className="text-foreground mb-2 text-xl font-bold">
                            {character.name}
                          </h3>
                        )}

                        {/* Chronicle Snippet */}
                        <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                          {getStoryContent(world)}
                        </p>

                        {/* Creator */}
                        {world.user_name && (
                          <div className="text-muted-foreground/70 mt-4 text-xs">
                            by {world.user_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination Dots */}
            {worlds.length > 3 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({
                  length: Math.max(worlds.length - 2, 1),
                }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentIndex
                        ? "bg-primary w-8"
                        : "bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
