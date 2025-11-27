"use client";

import ExpandableWorldCards from "./ExpandableWorldCards";
import { World } from "@/lib/schemas";
import { TrendingUp } from "lucide-react";

interface TrendingWorldsProps {
  worlds: World[];
}

export default function TrendingWorlds({ worlds }: TrendingWorldsProps) {
  if (worlds.length === 0) return null;

  return (
    <section className="bg-card/30 h-full rounded-xl p-4 md:p-6">
      <div className="mb-3 flex items-center gap-2 md:mb-4">
        <TrendingUp className="h-4 w-4 text-green-500 md:h-5 md:w-5" />
        <div>
          <h2 className="text-sm font-bold md:text-lg">Trending Now</h2>
          <p className="text-muted-foreground hidden text-xs md:block">
            Most active right now
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="block md:hidden">
          <ExpandableWorldCards worlds={worlds.slice(0, 1)} viewMode="row" />
        </div>
        <div className="hidden md:block">
          <ExpandableWorldCards worlds={worlds.slice(0, 3)} viewMode="row" />
        </div>
      </div>
    </section>
  );
}
