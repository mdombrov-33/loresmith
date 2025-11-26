import { useState, useEffect } from "react";
import { useWorlds } from "@/lib/queries/world";
import { useAppStore } from "@/stores/appStore";

export function useDiscoverLogic() {
  const { setAppStage } = useAppStore();
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "row">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    setAppStage("discover");
  }, [setAppStage]);

  useEffect(() => {
    setCurrentPage(1);
    setActiveSearchQuery("");
  }, [selectedTheme, selectedStatus]);

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setActiveSearchQuery(searchQuery.trim());
      setCurrentPage(1);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleViewModeChange = (mode: "grid" | "row") => {
    setViewMode(mode);
  };

  // Fetch featured world (first published world for now)
  const {
    data: { worlds: featuredWorlds = [] } = {},
    isLoading: isFeaturedLoading,
  } = useWorlds({
    scope: "global",
    limit: 1,
    offset: 0,
  });

  // Fetch highest rated worlds
  const {
    data: { worlds: highestRatedWorlds = [] } = {},
    isLoading: isHighestRatedLoading,
  } = useWorlds({
    scope: "global",
    limit: 6,
    offset: 0,
    sort: "rating_desc",
  });

  // Fetch trending worlds (most active)
  const {
    data: { worlds: trendingWorlds = [] } = {},
    isLoading: isTrendingLoading,
  } = useWorlds({
    scope: "global",
    limit: 6,
    offset: 0,
    sort: "active_sessions_desc",
  });

  // Fetch recently created worlds
  const {
    data: { worlds: recentWorlds = [] } = {},
    isLoading: isRecentLoading,
  } = useWorlds({
    scope: "global",
    limit: 6,
    offset: 0,
    sort: "created_at_desc",
  });

  // Fetch all worlds with filters
  const {
    data: { worlds: allWorlds = [], total = 0 } = {},
    isLoading: isAllWorldsLoading,
    error,
  } = useWorlds({
    scope: "global",
    theme: selectedTheme || undefined,
    status: selectedStatus || undefined,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
    search: activeSearchQuery || undefined,
  });

  const totalPages = Math.ceil(total / pageSize);

  return {
    selectedTheme,
    selectedStatus,
    setSelectedStatus: handleStatusChange,
    searchQuery,
    activeSearchQuery,
    setSearchQuery: handleSearchChange,
    handleSearch,
    handleThemeChange,
    viewMode,
    setViewMode: handleViewModeChange,
    featuredWorld: featuredWorlds[0],
    isFeaturedLoading,
    highestRatedWorlds,
    isHighestRatedLoading,
    trendingWorlds,
    isTrendingLoading,
    recentWorlds,
    isRecentLoading,
    allWorlds,
    isAllWorldsLoading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
  };
}
