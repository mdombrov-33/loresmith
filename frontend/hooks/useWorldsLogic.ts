import { useState, useEffect } from "react";
import { useWorlds } from "@/lib/queries/world";
import { useAppStore } from "@/stores/appStore";
import { scrollToElement } from "@/lib/utils";

interface ScopeFilters {
  theme: string;
  status: string;
  sort: string;
}

interface UseWorldsLogicProps {
  scope: "my" | "global";
  appStage?: "discover" | "my-worlds";
}

export function useWorldsLogic({
  scope,
  appStage = "discover",
}: UseWorldsLogicProps) {
  const { setAppStage } = useAppStore();

  //* Scope-specific filters
  const [filters, setFilters] = useState<Record<"my" | "global", ScopeFilters>>(
    {
      my: { theme: "", status: "", sort: "created_at_desc" },
      global: { theme: "", status: "", sort: "created_at_desc" },
    },
  );

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "row">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const currentFilters = filters[scope];

  useEffect(() => {
    setAppStage(appStage);
  }, [setAppStage, appStage]);

  useEffect(() => {
    setCurrentPage(1);
    setActiveSearchQuery("");
  }, [currentFilters]);

  //* Page-agnostic filter handlers(my/global)
  const handleThemeChange = (theme: string) => {
    setFilters((prev) => ({
      ...prev,
      [scope]: { ...prev[scope], theme },
    }));
  };

  const handleStatusChange = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      [scope]: { ...prev[scope], status },
    }));
  };

  const handleSortChange = (sort: string) => {
    setFilters((prev) => ({
      ...prev,
      [scope]: { ...prev[scope], sort },
    }));
  };

  //* Handle search on discover page
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setActiveSearchQuery(searchQuery.trim());
      setCurrentPage(1);
      //* Scroll to catalog section to show search results
      setTimeout(() => {
        scrollToElement("catalog-section", 100);
      }, 100);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleViewModeChange = (mode: "grid" | "row") => {
    setViewMode(mode);
  };

  //* Fetch featured world (only used on discover page)
  const {
    data: { worlds: featuredWorlds = [] } = {},
    isLoading: isFeaturedLoading,
  } = useWorlds({
    scope: "global",
    limit: 1,
    offset: 0,
  });

  //* Fetch highest rated worlds (only used on discover page)
  const {
    data: { worlds: highestRatedWorldsList = [] } = {},
    isLoading: isHighestRatedLoading,
  } = useWorlds({
    scope: "global",
    limit: 3,
    offset: 0,
    sort: "rating_desc",
  });

  //* Fetch trending worlds (only used on discover page)
  const {
    data: { worlds: trendingWorldsList = [] } = {},
    isLoading: isTrendingLoading,
  } = useWorlds({
    scope: "global",
    limit: 3,
    offset: 0,
    sort: "active_sessions_desc",
  });

  //* Fetch recently created worlds (only used on discover page)
  const {
    data: { worlds: recentWorldsList = [] } = {},
    isLoading: isRecentLoading,
  } = useWorlds({
    scope: "global",
    limit: 3,
    offset: 0,
    sort: "created_at_desc",
  });

  //* Return empty arrays for non-global scopes to avoid showing discover-specific data
  const featuredWorld = scope === "global" ? featuredWorlds[0] : undefined;
  const highestRatedWorlds = scope === "global" ? highestRatedWorldsList : [];
  const trendingWorlds = scope === "global" ? trendingWorldsList : [];
  const recentWorlds = scope === "global" ? recentWorldsList : [];

  //* Fetch all worlds with filters (main query for current scope)
  const {
    data: { worlds: allWorlds = [], total = 0 } = {},
    isLoading: isAllWorldsLoading,
    error,
  } = useWorlds({
    scope,
    theme: currentFilters.theme || undefined,
    status: currentFilters.status || undefined,
    sort: currentFilters.sort || undefined,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
    search: activeSearchQuery || undefined,
  });

  const totalPages = Math.ceil(total / pageSize);

  return {
    selectedTheme: currentFilters.theme,
    selectedStatus: currentFilters.status,
    selectedSort: currentFilters.sort,
    handleThemeChange,
    handleStatusChange,
    handleSortChange,
    searchQuery,
    activeSearchQuery,
    setSearchQuery: handleSearchChange,
    handleSearch,
    viewMode,
    setViewMode: handleViewModeChange,
    featuredWorld,
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
