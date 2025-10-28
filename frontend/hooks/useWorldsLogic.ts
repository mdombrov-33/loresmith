import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorld } from "@/lib/queries";
import { useTheme } from "next-themes";
import { useAppStore } from "@/stores/appStore";
import { THEMES } from "@/constants/game-themes";
import { FullStory } from "@/types/api";

export function useWorldsLogic() {
  const params = useParams();
  const router = useRouter();
  const themeParamRaw = params?.theme;
  const idParamRaw = params?.id;
  const themeParam = Array.isArray(themeParamRaw)
    ? themeParamRaw[0]
    : themeParamRaw || "fantasy";
  const idParam = Array.isArray(idParamRaw) ? idParamRaw[0] : idParamRaw;

  const urlToThemeMap: Record<string, string> = {
    fantasy: THEMES.FANTASY,
    norse: THEMES.NORSE,
    cyberpunk: THEMES.CYBERPUNK,
    "post-apoc": THEMES.POST_APOCALYPTIC,
    steampunk: THEMES.STEAMPUNK,
  };

  const actualTheme = urlToThemeMap[themeParam] || themeParam;

  const { setTheme: setNextTheme } = useTheme();
  const { setAppStage, setTheme: setStoreTheme, isHydrated } = useAppStore();

  const displayNames: Record<string, string> = {
    character: "Character",
    faction: "Faction",
    setting: "Setting",
    event: "Event",
    relic: "Relic",
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const sortDetails = (details: Record<string, unknown>) => {
    const order = [
      "appearance",
      "personality",
      "creativity",
      "empathy",
      "influence",
      "lore_mastery",
      "perception",
      "resilience",
      "health",
      "stress",
      "skills",
    ];

    return Object.entries(details).sort(([a], [b]) => {
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  };

  const worldId = idParam ? Number(idParam) : NaN;
  const { data: storyData, isLoading, error } = useWorld(worldId);

  const parsedStory: FullStory = storyData
    ? JSON.parse(storyData.full_story)
    : {};

  useEffect(() => {
    setAppStage("story");
    return () => setAppStage("home");
  }, [setAppStage]);

  useEffect(() => {
    if (!isHydrated) return;

    if (!idParam || isNaN(worldId)) {
      router.replace("/");
      return;
    }

    if (typeof actualTheme === "string") {
      setStoreTheme(actualTheme);
      setNextTheme(actualTheme);
    }
  }, [
    idParam,
    actualTheme,
    isHydrated,
    router,
    setStoreTheme,
    setNextTheme,
    worldId,
  ]);

  const themeMismatch = storyData?.theme && storyData.theme !== actualTheme;
  const displayError = error
    ? error.message || "Failed to load world"
    : themeMismatch
      ? `This world was created with the "${storyData.theme}" theme, not "${actualTheme}". Please use the correct theme in the URL.`
      : null;

  const paragraphs = (parsedStory.content ?? "").split("\n\n").filter(Boolean);

  const lorePieces = storyData?.lore_pieces || [];

  return {
    isLoading,
    displayError,
    storyData,
    parsedStory,
    paragraphs,
    lorePieces,
    displayNames,
    truncateText,
    sortDetails,
    actualTheme,
    worldId,
  };
}
