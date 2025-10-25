import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useWorlds } from "@/lib/queries";
import { World } from "@/types/api";
import { useAppStore } from "@/stores/appStore";

export function useSearchLogic() {
  const { setAppStage, searchScope, setSearchScope } = useAppStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlTheme = searchParams.get("theme");
  const urlScope = searchParams.get("scope") as "my" | "global" | null;

  const [selectedTheme, setSelectedTheme] = useState<string>(urlTheme || "");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    setAppStage("search");
  }, [setAppStage]);

  useEffect(() => {
    if (urlScope && urlScope !== "my") {
      setSearchScope(urlScope);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchScope) {
      params.set("scope", searchScope);
    } else {
      params.delete("scope");
    }
    router.replace(`/search?${params.toString()}`);
  }, [searchScope, searchParams, router]);

  useEffect(() => {
    if (urlTheme !== selectedTheme) {
      setSelectedTheme(urlTheme || "");
    }
  }, [urlTheme, selectedTheme]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchScope, selectedTheme, selectedStatus]);

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

  const handleScopeChange = (scope: "my" | "global") => {
    setSearchScope(scope);
  };

  const {
    data: { worlds = [], total = 0 } = {},
    isLoading,
    error,
  } = useWorlds({
    scope: searchScope,
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
    selectedScope: searchScope,
    setSelectedScope: handleScopeChange,
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
