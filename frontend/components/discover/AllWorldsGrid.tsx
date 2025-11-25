"use client";

import ExpandableWorldCards from "./ExpandableWorldCards";
import { World } from "@/lib/schemas";

interface AllWorldsGridProps {
  worlds: World[];
  viewMode: "grid" | "row";
}

export default function AllWorldsGrid({ worlds, viewMode }: AllWorldsGridProps) {
  if (worlds.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-lg text-muted-foreground">No worlds found</p>
      </div>
    );
  }

  return <ExpandableWorldCards worlds={worlds} viewMode={viewMode} />;
}
