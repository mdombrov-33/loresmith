import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useWorlds } from "@/lib/queries";
import { World } from "@/types/api";
import { useAppStore } from "@/stores/appStore";

export function useSearchLogic() {
  const { setAppStage } = useAppStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlTheme = searchParams.get("theme");

  const [selectedScope, setSelectedScope] = useState<"my" | "global">("my");
  const [selectedTheme, setSelectedTheme] = useState<string>(urlTheme || "");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    setAppStage("search");
  }, [setAppStage]);

  useEffect(() => {
    if (urlTheme !== selectedTheme) {
      setSelectedTheme(urlTheme || "");
    }
  }, [urlTheme, selectedTheme]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedScope, selectedTheme, selectedStatus]);

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    const params = new URLSearchParams(searchParams.toString());
    if (theme) {
      params.set("theme", theme);
    } else {
      params.delete("theme");
    }
    router.replace(`/search?${params.toString()}`);
  };

  const {
    data: { worlds = [], total = 0 } = {},
    isLoading,
    error,
  } = useWorlds({
    scope: selectedScope,
    theme: selectedTheme || undefined,
    status: selectedStatus || undefined,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
  });

  const totalPages = Math.ceil(total / pageSize);

  const filteredWorlds = worlds.filter((world: World) => {
    if (searchQuery) {
      const fullStory = JSON.parse(world.full_story);
      const searchableText = [
        fullStory.title,
        fullStory.content,
        fullStory.theme,
        fullStory.quest?.title,
        fullStory.quest?.description,
      ]
        .join(" ")
        .toLowerCase();
      return searchableText.includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return {
    selectedScope,
    setSelectedScope,
    selectedTheme,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    handleThemeChange,
    worlds: filteredWorlds,
    isLoading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
  };
}
