"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useWorld } from "@/lib/queries/world";
import { useAppStore } from "@/stores/appStore";

export default function AdventurePageClient() {
  const params = useParams();
  const sessionId = parseInt(params.session_id as string, 10);
  const { setTheme, setAudioTheme } = useAppStore();

  // TODO Phase 1: Implement adventure page with theme syncing
  // Steps:
  // 1. In lib/api.ts: Uncomment and implement getAdventureSession(sessionId)
  // 2. In lib/queries.ts: Uncomment and implement useAdventureSession(sessionId)
  // 3. Here: const { data: session } = useAdventureSession(sessionId)
  // 4. Here: const { data: world } = useWorld(session?.world_id)
  // 5. Here: In useEffect, setTheme(world?.theme) and setAudioTheme(world?.theme)
  // 6. Implement actual adventure gameplay UI (scenes, choices, dice rolls, etc.)

  // Placeholder - will be replaced in Phase 1
  useEffect(() => {
    // When Phase 1 is implemented:
    // if (world?.theme) {
    //   setTheme(world.theme);
    //   setAudioTheme(world.theme);
    // }
  }, [sessionId, setTheme, setAudioTheme]);

  return (
    <main className="bg-background flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-foreground mb-4 text-4xl font-bold">
          Adventure Mode
        </h1>
        <p className="text-muted-foreground">Session ID: {sessionId}</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Coming in Phase 1: Interactive adventure gameplay
        </p>
      </div>
    </main>
  );
}
