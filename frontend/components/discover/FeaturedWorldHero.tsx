"use client";

import { World } from "@/lib/schemas";
import Image from "next/image";
import { PrimaryButton } from "@/components/shared/buttons";
import { useRouter } from "next/navigation";
import { Sparkles, Users, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { THEME_OPTIONS } from "@/constants/game-themes";

interface FeaturedWorldHeroProps {
  world?: World;
}

export default function FeaturedWorldHero({ world }: FeaturedWorldHeroProps) {
  const router = useRouter();

  if (!world) {
    // Placeholder when no world
    return (
      <section className="relative h-[500px] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-background to-secondary/20">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="mx-auto mb-4 h-16 w-16 text-primary" />
            <h2 className="text-4xl font-bold">Featured World Coming Soon</h2>
            <p className="mt-2 text-muted-foreground">
              Check back for our handpicked world of the week
            </p>
          </div>
        </div>
      </section>
    );
  }

  const themeOption = THEME_OPTIONS.find((t) => t.value === world.theme);

  return (
    <section className="relative h-[500px] w-full overflow-hidden rounded-3xl">
      {/* Background Image with Overlay */}
      {world.portrait_url && (
        <>
          <div className="absolute inset-0">
            <Image
              fill
              src={world.portrait_url}
              alt={world.full_story.quest?.title || "Featured world"}
              className="object-cover object-center"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-end p-8 md:p-12">
        <div className="max-w-2xl">
          {/* Featured Badge */}
          <div className="mb-4 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Featured World
            </span>
          </div>

          {/* Theme Badge */}
          {themeOption && (
            <Badge variant="outline" className="mb-4 border-white/20 bg-white/10">
              {themeOption.label}
            </Badge>
          )}

          {/* Title */}
          <h1 className="mb-4 text-5xl font-bold leading-tight text-white md:text-6xl">
            {world.full_story.quest?.title || "Untitled World"}
          </h1>

          {/* Description */}
          <p className="mb-6 line-clamp-3 text-lg text-white/80">
            {world.full_story.content || "No description available"}
          </p>

          {/* Meta Info */}
          <div className="mb-6 flex items-center gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <span>by {world.user_name || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>0.0 Rating</span>
            </div>
            {world.active_sessions !== undefined && world.active_sessions > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-400" />
                <span className="text-green-400">
                  {world.active_sessions} Active
                </span>
              </div>
            )}
          </div>

          {/* CTA */}
          <PrimaryButton
            onClick={() => router.push(`/worlds/${world.theme}/${world.id}`)}
            className="text-base"
          >
            Explore This World
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}
