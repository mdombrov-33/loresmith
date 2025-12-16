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

  const displayImage = world.active_image_type === "world_scene" && world.image_url
    ? world.image_url
    : world.portrait_url;

  const currentImageType = world.active_image_type;

  return (
    <>
      {/* World Scene Layout - Full width with overlay */}
      {displayImage && currentImageType === "world_scene" && (
        <section className="relative h-[500px] w-full overflow-hidden rounded-3xl">
          <div className="absolute inset-0">
            <Image
              fill
              src={displayImage}
              alt={world.full_story.quest?.title || "Featured world"}
              className="h-full object-cover object-center"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

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
      )}

      {/* Portrait Layout - Responsive: Stack on mobile, split on desktop */}
      {displayImage && currentImageType === "portrait" && (
        <section className="relative w-full overflow-hidden rounded-3xl">
          {/* Mobile: Stacked layout */}
          <div className="flex flex-col md:hidden">
            {/* Portrait on top */}
            <div className="relative aspect-[4/3] w-full">
              <Image
                fill
                src={displayImage}
                alt={world.full_story.quest?.title || "Featured world"}
                className="object-cover object-center"
                priority
              />
            </div>

            {/* Content below */}
            <div className="bg-background flex flex-col gap-4 p-6">
              {/* Featured Badge */}
              <div className="flex items-center gap-2">
                <Sparkles className="text-primary h-4 w-4" />
                <span className="text-primary text-xs font-semibold tracking-wider uppercase">
                  Featured World
                </span>
              </div>

              {/* Theme Badge */}
              {themeOption && (
                <Badge variant="outline" className="w-fit">
                  {themeOption.label}
                </Badge>
              )}

              {/* Title */}
              <h1 className="text-2xl leading-tight font-bold">
                {world.full_story.quest?.title || "Untitled World"}
              </h1>

              {/* Description */}
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {world.full_story.quest?.description || "No description available"}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
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
                className="w-fit text-sm"
              >
                Explore This World
              </PrimaryButton>
            </div>
          </div>

          {/* Desktop: Split layout */}
          <div className="relative hidden h-[500px] md:block">
            {/* Background gradient */}
            <div className="from-background via-background/95 to-muted/90 absolute inset-0 bg-gradient-to-r" />

            {/* Portrait on left side */}
            <div className="absolute top-0 bottom-0 left-0 w-1/2">
              <Image
                fill
                src={displayImage}
                alt={world.full_story.quest?.title || "Featured world"}
                className="object-cover object-center"
                priority
              />
              <div className="to-background absolute inset-0 bg-gradient-to-r from-transparent" />
            </div>

            {/* Content on right side */}
            <div className="absolute inset-y-0 right-0 flex w-1/2 flex-col justify-center gap-4 px-8 lg:px-12">
              {/* Featured Badge */}
              <div className="flex items-center gap-2">
                <Sparkles className="text-primary h-4 w-4" />
                <span className="text-primary text-xs font-semibold tracking-wider uppercase">
                  Featured World
                </span>
              </div>

              {/* Theme Badge */}
              {themeOption && (
                <Badge variant="outline" className="w-fit">
                  {themeOption.label}
                </Badge>
              )}

              {/* Title */}
              <h1 className="text-2xl leading-tight font-bold lg:text-3xl">
                {world.full_story.quest?.title || "Untitled World"}
              </h1>

              {/* Description */}
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {world.full_story.quest?.description || "No description available"}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
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
                className="w-fit text-sm lg:text-base"
              >
                Explore This World
              </PrimaryButton>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
