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
      <section className="from-primary/20 via-background to-secondary/20 relative h-[650px] w-full overflow-hidden rounded-3xl bg-gradient-to-br">
        <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
          {/* Featured Badge - Top */}
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary h-4 w-4" />
            <span className="text-primary text-xs font-semibold tracking-wider uppercase">
              Featured World
            </span>
          </div>

          {/* Center Content */}
          <div className="text-center">
            <Sparkles className="text-primary mx-auto mb-4 h-12 w-12" />
            <h2 className="text-3xl font-bold">Coming Soon</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Check back for our handpicked world of the week
            </p>
          </div>

          {/* Bottom spacer for balance */}
          <div />
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
              className="h-full object-cover object-top"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
        </>
      )}

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
        {/* Featured Badge - Top */}
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary h-4 w-4" />
          <span className="text-primary text-xs font-semibold tracking-wider uppercase">
            Featured World
          </span>
        </div>

        {/* Bottom Content */}
        <div className="max-w-2xl">
          {/* Theme Badge */}
          {themeOption && (
            <Badge
              variant="outline"
              className="mb-3 border-white/20 bg-white/10"
            >
              {themeOption.label}
            </Badge>
          )}

          {/* Title */}
          <h1 className="mb-2 text-3xl leading-tight font-bold text-white md:text-4xl">
            {world.full_story.quest?.title || "Untitled World"}
          </h1>

          {/* Description */}
          <p className="mb-3 line-clamp-3 text-sm text-white/80 md:text-base">
            {world.full_story.quest?.description || "No description available"}
          </p>

          {/* Meta Info */}
          <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-white/60">
            <div className="flex items-center gap-1">
              <span>by {world.user_name || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{world.rating?.toFixed(1)}</span>
            </div>
            {world.active_sessions !== undefined &&
              world.active_sessions > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-green-400" />
                  <span className="text-green-400">
                    {world.active_sessions} Active
                  </span>
                </div>
              )}
          </div>

          {/* CTA */}
          <PrimaryButton
            onClick={() => router.push(`/worlds/${world.theme}/${world.id}`)}
            className="text-sm md:text-base"
          >
            Explore This World
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}
