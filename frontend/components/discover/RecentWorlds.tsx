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
    <section className="py-12">
      <div className="mb-8 flex items-center gap-3">
        <Clock className="h-6 w-6 text-blue-500" />
        <div>
          <h2 className="text-3xl font-bold">Recently Created</h2>
          <p className="text-muted-foreground">
            Fresh worlds just added to the hub
          </p>
        </div>
      </div>
      <ExpandableWorldCards worlds={worlds.slice(0, 6)} viewMode="grid" />
    </section>
  );
}
