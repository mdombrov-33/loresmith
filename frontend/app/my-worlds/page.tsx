"use client";

import { useAppStore } from "@/stores/appStore";
import { useEffect } from "react";

export default function MyWorlds() {
  const { setAppStage } = useAppStore();

  useEffect(() => {
    setAppStage("hub");
  }, [setAppStage]);

  return (
    <main className="min-h-screen p-8">
      <div className="container mx-auto">
        <h1 className="mb-8 text-4xl font-bold">My Worlds</h1>
        <p className="text-muted-foreground">
          Your created worlds will appear here. We&apos;ll move the existing hub content here.
        </p>
      </div>
    </main>
  );
}
