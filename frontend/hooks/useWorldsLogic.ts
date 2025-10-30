import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useWorld } from "@/lib/queries";
import { FullStory } from "@/types/api";
import { useAppStore } from "@/stores/appStore";

export function useWorldsLogic() {
  const params = useParams();
  const worldId = parseInt(params.id as string, 10);
  const actualTheme = params.theme as string;
  const { setTheme, setAudioTheme } = useAppStore();

  const { data: world, isLoading, error } = useWorld(worldId);

  // Sync theme when viewing a world
  useEffect(() => {
    if (actualTheme) {
      setTheme(actualTheme);
      setAudioTheme(actualTheme);
    }
  }, [actualTheme, setTheme, setAudioTheme]);

  let parsedStory: FullStory | null = null;
  let displayError: string | null = null;

  if (error) {
    displayError = "Failed to load world";
  } else if (world?.full_story) {
    try {
      parsedStory = JSON.parse(world.full_story);
    } catch (e) {
      displayError = "Failed to parse world story";
    }
  }

  const paragraphs = parsedStory?.content?.split("\n\n").filter(Boolean) || [];

  const lorePieces = parsedStory?.pieces
    ? [
        parsedStory.pieces.character,
        parsedStory.pieces.faction,
        parsedStory.pieces.setting,
        parsedStory.pieces.event,
        parsedStory.pieces.relic,
      ].filter(Boolean)
    : [];

  const displayNames: Record<string, string> = {
    character: "Protagonist",
    faction: "Faction",
    setting: "Setting",
    event: "Event",
    relic: "Relic",
  };

  const sortDetails = (details: Record<string, string>) => {
    const order = [
      "personality",
      "appearance",
      "flaw",
      "skills",
      "ideology",
      "description",
      "geography",
      "climate",
      "culture",
      "conflict",
      "power",
      "origin",
      "abilities",
    ];

    return Object.entries(details).sort((a, b) => {
      const indexA = order.indexOf(a[0]);
      const indexB = order.indexOf(b[0]);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  };

  return {
    isLoading,
    displayError,
    parsedStory: parsedStory!,
    paragraphs,
    lorePieces,
    displayNames,
    sortDetails,
    actualTheme,
    worldId,
  };
}
