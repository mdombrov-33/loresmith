"use client";

import ExpandableWorldCards from "./ExpandableWorldCards";
import { World } from "@/lib/schemas";
import { Flame } from "lucide-react";

interface TrendingWorldsProps {
  worlds: World[];
}

export default function TrendingWorlds({ worlds }: TrendingWorldsProps) {
  if (worlds.length === 0) return null;

  return (
    <section className="py-12">
      <div className="mb-8 flex items-center gap-3">
        <Flame className="h-6 w-6 text-orange-500" />
        <div>
          <h2 className="text-3xl font-bold">Trending Now</h2>
          <p className="text-muted-foreground">
            Most active worlds right now
          </p>
        </div>
      </div>
      <ExpandableWorldCards worlds={worlds.slice(0, 6)} viewMode="grid" />
    </section>
  );
}
