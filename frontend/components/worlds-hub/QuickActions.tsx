"use client";

import { useRouter } from "next/navigation";
import ActionButton from "@/components/shared/ActionButton";
import { Plus, Play, TrendingUp } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { World } from "@/types/api";

interface QuickActionsProps {
  myWorlds: World[];
}

export default function QuickActions({ myWorlds }: QuickActionsProps) {
  const router = useRouter();
  const { theme } = useAppStore();

  const lastActiveWorld = myWorlds
    .filter((w) => w.session_id)
    .sort((a, b) => {
      const aDate = new Date(a.updated_at || 0);
      const bDate = new Date(b.updated_at || 0);
      return bDate.getTime() - aDate.getTime();
    })[0];

  const handleCreateNew = () => {
    router.push(`/generate?theme=${theme || "fantasy"}`);
  };

  const handleContinueAdventure = () => {
    if (lastActiveWorld?.session_id) {
      router.push(`/adventure/${lastActiveWorld.session_id}`);
    }
  };

  const handleViewStats = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mb-8 flex flex-wrap gap-4">
      <ActionButton
        size="lg"
        onClick={handleCreateNew}
        icon={<Plus className="h-5 w-5" />}
        className="min-w-[200px] flex-1"
      >
        Create New World
      </ActionButton>

      {lastActiveWorld && (
        <ActionButton
          size="lg"
          variant="secondary"
          onClick={handleContinueAdventure}
          icon={<Play className="h-5 w-5" />}
          className="min-w-[200px] flex-1"
        >
          Continue Adventure
        </ActionButton>
      )}

      <ActionButton
        size="lg"
        variant="outline"
        onClick={handleViewStats}
        icon={<TrendingUp className="h-5 w-5" />}
        className="min-w-[200px]"
      >
        View Stats
      </ActionButton>
    </div>
  );
}
