"use client";

import ExpandableWorldCards from "./ExpandableWorldCards";
import { World } from "@/lib/schemas";
import { Trophy } from "lucide-react";

interface HighestRatedWorldsProps {
  worlds: World[];
}

export default function HighestRatedWorlds({ worlds }: HighestRatedWorldsProps) {
  if (worlds.length === 0) return null;

  return (
    <section className="rounded-xl bg-card/30 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-amber-500" />
        <div>
          <h2 className="text-lg font-bold">Highest Rated</h2>
          <p className="text-xs text-muted-foreground">
            Top rated by community
          </p>
        </div>
      </div>
      <ExpandableWorldCards worlds={worlds.slice(0, 3)} viewMode="row" />
    </section>
  );
}
