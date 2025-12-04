"use client";

import { Trophy, TrendingUp, Clock } from "lucide-react";

/**
 * Skeleton for the Featured World Hero section
 */
export function FeaturedWorldSkeleton() {
  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-3xl bg-card/50">
      <div className="animate-pulse">
        {/* Background shimmer */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted/80 via-muted/50 to-muted/80" />

        {/* Content area */}
        <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
          {/* Featured badge skeleton */}
          <div className="h-4 w-32 rounded bg-muted" />

          {/* Bottom content skeleton */}
          <div className="max-w-2xl space-y-3">
            <div className="h-6 w-24 rounded bg-muted" />
            <div className="h-10 w-3/4 rounded bg-muted md:h-12" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-5/6 rounded bg-muted" />
            </div>
            <div className="flex gap-3 pt-2">
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="h-4 w-16 rounded bg-muted" />
              <div className="h-4 w-24 rounded bg-muted" />
            </div>
            <div className="h-10 w-40 rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for a single world card in row mode
 */
function WorldRowCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-row items-center gap-3 rounded-xl p-3 md:gap-4 md:p-4">
      {/* Thumbnail skeleton */}
      <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-muted md:h-20 md:w-20" />

      {/* Content skeleton */}
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-4 w-3/4 rounded bg-muted md:h-5" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="flex gap-3">
          <div className="h-3 w-12 rounded bg-muted" />
          <div className="h-3 w-12 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Highest Rated/Trending/Recent sections
 */
interface SectionSkeletonProps {
  icon?: "trophy" | "trending" | "clock";
  title: string;
  subtitle?: string;
  cardCount?: number;
}

export function SectionCardsSkeleton({
  icon = "trophy",
  title,
  subtitle,
  cardCount = 3
}: SectionSkeletonProps) {
  const Icon = icon === "trophy" ? Trophy : icon === "trending" ? TrendingUp : Clock;

  return (
    <section className="h-full rounded-xl bg-card/30 p-4 md:p-6">
      <div className="mb-3 flex items-center gap-2 md:mb-4">
        <Icon className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
        <div className="space-y-1">
          <h2 className="text-sm font-bold md:text-lg">{title}</h2>
          {subtitle && (
            <p className="hidden text-xs text-muted-foreground md:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {/* Mobile: show 1 card */}
        <div className="block md:hidden">
          <WorldRowCardSkeleton />
        </div>
        {/* Desktop: show cardCount cards */}
        <div className="hidden md:block">
          {Array.from({ length: cardCount }).map((_, i) => (
            <WorldRowCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Skeleton for the main catalog grid
 */
export function WorldGridSkeleton({ viewMode = "grid" }: { viewMode?: "grid" | "row" }) {
  if (viewMode === "row") {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex animate-pulse flex-row items-center gap-4 rounded-xl p-4"
          >
            <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-muted" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
              <div className="flex gap-3">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-3 w-12 rounded bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Grid view
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl p-4"
        >
          {/* Image skeleton */}
          <div className="mb-4 aspect-[4/3] w-full rounded-lg bg-muted" />

          {/* Content skeleton */}
          <div className="space-y-3">
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="h-6 w-20 rounded-full bg-muted" />
            <div className="flex gap-3">
              <div className="h-3 w-12 rounded bg-muted" />
              <div className="h-3 w-12 rounded bg-muted" />
              <div className="h-3 w-16 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
