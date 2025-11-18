import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useWorld } from "@/lib/queries/world";
import { FullStory } from "@/lib/schemas";
import { useAppStore } from "@/stores/appStore";

export function useWorldsLogic() {
  const params = useParams();
  const worldId = parseInt(params.id as string, 10);
  const actualTheme = params.theme as string;
  const { setTheme, setAudioTheme, setAppStage } = useAppStore();

  const { data: world, isLoading, error } = useWorld(worldId);

  useEffect(() => {
    setAppStage("story");
  }, [setAppStage]);

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

  // Use lore_pieces from database (has R2 URLs) instead of full_story JSON
  // Sort so character is first
  const lorePieces = (world?.lore_pieces || []).sort((a, b) => {
    if (a.type === "character") return -1;
    if (b.type === "character") return 1;
    return 0;
  });

  const displayNames: Record<string, string> = {
    character: "Protagonist",
    faction: "Faction",
    setting: "Setting",
    event: "Event",
    relic: "Relic",
  };

  const sortDetails = (details: Record<string, unknown>) => {
    const order = [
      "traits",
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
    world,
  };
}
