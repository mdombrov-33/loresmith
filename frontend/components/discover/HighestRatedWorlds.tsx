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
    <section className="py-12">
      <div className="mb-8 flex items-center gap-3">
        <Trophy className="h-6 w-6 text-amber-500" />
        <div>
          <h2 className="text-3xl font-bold">Highest Rated</h2>
          <p className="text-muted-foreground">
            Top rated worlds by the community
          </p>
        </div>
      </div>
      <ExpandableWorldCards worlds={worlds.slice(0, 6)} viewMode="grid" />
    </section>
  );
}
