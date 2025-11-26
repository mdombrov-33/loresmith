"use client";

import ExpandableWorldCards from "./ExpandableWorldCards";
import { World } from "@/lib/schemas";
import { Clock } from "lucide-react";

interface RecentWorldsProps {
  worlds: World[];
}

export default function RecentWorlds({ worlds }: RecentWorldsProps) {
  if (worlds.length === 0) return null;

  return (
    <section className="rounded-xl bg-card/30 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-blue-500" />
        <div>
          <h2 className="text-lg font-bold">Recently Created</h2>
          <p className="text-xs text-muted-foreground">
            Fresh worlds added
          </p>
        </div>
      </div>
      <ExpandableWorldCards worlds={worlds.slice(0, 3)} viewMode="row" />
    </section>
  );
}
