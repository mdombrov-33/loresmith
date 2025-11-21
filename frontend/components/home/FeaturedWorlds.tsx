"use client";

import { useIntersectionObserver } from "@/hooks/styling/useIntersectionObserver";
import { useWorlds } from "@/lib/queries/world";
import { Sparkles, Star, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import CardImage from "@/components/shared/card/CardImage";
import GlobalLoading from "@/components/shared/LoadingStates/GlobalLoading";

export default function FeaturedWorlds() {
  const { elementRef, isVisible } = useIntersectionObserver();

  const { data, isLoading } = useWorlds({
    scope: "global",
    limit: 3,
  });

  const worlds = data?.worlds || [];

  if (isLoading) {
    return (
      <section className="relative overflow-hidden py-16">
        <GlobalLoading message="Loading featured worlds..." />
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
              Explore rich narratives crafted across different themes
            </p>
          </div>
        </div>

        {/* World Cards Grid */}
        <div
          className={`grid gap-6 transition-all duration-700 md:grid-cols-2 lg:grid-cols-3 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {worlds.map((world) => {
            const character = world.lore_pieces?.find(
              (piece) => piece.type === "character",
            );
            const portraitUrl =
              world.portrait_url || character?.details?.portrait_url;

            return (
              <Link
                key={world.id}
                href={`/worlds/${world.theme}/${world.id}`}
                className="group"
              >
                <div className="border-border bg-card/50 hover:bg-card h-full overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                  {/* Portrait */}
                  {portraitUrl && (
                    <div className="relative overflow-hidden">
                      <div className="relative transition-transform duration-300 group-hover:scale-105">
                        <CardImage
                          src={portraitUrl}
                          alt={character?.name || "World character"}
                          objectFit="contain"
                          height="h-64"
                        />
                        {/* Gradient overlay - scales with image */}
                        <div className="from-card/95 via-card/40 pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent" />
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="space-y-4 p-6">
                    {/* Theme Badge */}
                    <div className="flex items-center justify-between">
                      <span className="bg-primary/10 text-primary border-primary/20 rounded-full border px-3 py-1 text-xs font-semibold tracking-wider uppercase">
                        {world.theme}
                      </span>
                      <Sparkles className="text-primary h-4 w-4" />
                    </div>

                    {/* Character Name */}
                    {character && (
                      <h3 className="text-foreground text-2xl leading-tight font-bold">
                        {character.name}
                      </h3>
                    )}

                    {/* Chronicle Snippet */}
                    <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                      {world.full_story?.content || ""}
                    </p>

                    {/* Social Proof */}
                    <div className="border-border/50 flex items-center gap-3 border-t pt-2 text-xs">
                      {/* Star Rating */}
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-foreground font-medium">0.0</span>
                        <span className="text-muted-foreground">(0)</span>
                      </div>

                      {/* Comments */}
                      <div className="text-muted-foreground flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>0</span>
                      </div>

                      {/* Active Players */}
                      {world.active_sessions !== undefined &&
                        world.active_sessions > 0 && (
                          <div className="flex items-center gap-1 text-green-400">
                            <Users className="h-3.5 w-3.5" />
                            <span>{world.active_sessions}</span>
                          </div>
                        )}
                    </div>

                    {/* Creator */}
                    {world.user_name && (
                      <div className="text-muted-foreground/70 text-xs">
                        by {world.user_name}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
