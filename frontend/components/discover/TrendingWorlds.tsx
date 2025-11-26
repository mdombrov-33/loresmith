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
    <section className="rounded-xl bg-card/30 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Flame className="h-5 w-5 text-orange-500" />
        <div>
          <h2 className="text-lg font-bold">Trending Now</h2>
          <p className="text-xs text-muted-foreground">
            Most active right now
          </p>
        </div>
      </div>
      <ExpandableWorldCards worlds={worlds.slice(0, 3)} viewMode="row" />
    </section>
  );
}
