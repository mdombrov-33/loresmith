import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useWorlds } from "@/lib/queries/world";
import { useAppStore } from "@/stores/appStore";

export function useWorldsHubLogic() {
  const {
    setAppStage,
    searchScope,
    setSearchScope,
    searchTheme,
    setSearchTheme,
    searchStatus,
    setSearchStatus,
  } = useAppStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlTheme = searchParams.get("theme");
  const urlScope = searchParams.get("scope") as "my" | "global" | null;
  const urlStatus = searchParams.get("status");

  const [selectedTheme, setSelectedTheme] = useState<string>(
    urlTheme || searchTheme || "",
  );
  const [selectedStatus, setSelectedStatus] = useState<string>(
    urlStatus || searchStatus || "",
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    setAppStage("discover");
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
    router.replace(`/worlds-hub?${params.toString()}`);
  }, [searchScope, searchParams, router]);

  useEffect(() => {
    if (urlTheme !== selectedTheme) {
      setSelectedTheme(urlTheme || "");
    }
  }, [urlTheme, selectedTheme]);

  useEffect(() => {
    if (urlStatus !== selectedStatus) {
      setSelectedStatus(urlStatus || "");
    }
  }, [urlStatus, selectedStatus]);

  useEffect(() => {
    setCurrentPage(1);
    setActiveSearchQuery("");
  }, [searchScope, selectedTheme, selectedStatus]);

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    setSearchTheme(theme);
    const params = new URLSearchParams(searchParams.toString());
    if (theme) {
      params.set("theme", theme);
    } else {
      params.delete("theme");
    }
    router.replace(`/worlds-hub?${params.toString()}`);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setSearchStatus(status);
    const params = new URLSearchParams(searchParams.toString());
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    router.replace(`/worlds-hub?${params.toString()}`);
  };

  const handleScopeChange = (scope: "my" | "global") => {
    setSearchScope(scope);
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

  const {
    data: { worlds: allWorlds = [], total = 0 } = {},
    isLoading,
    error,
  } = useWorlds({
    scope: searchScope,
    theme: selectedTheme || undefined,
    status: selectedStatus || undefined,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
    search: activeSearchQuery || undefined,
  });

  // Fetch all user's worlds for stats (no filters)
  const { data: { worlds: myWorlds = [] } = {} } = useWorlds({
    scope: "my",
    limit: 100, // Get all worlds for stats
    offset: 0,
  });

  //* For search queries, paginate locally from all worlds
  const worlds = activeSearchQuery
    ? allWorlds
        .sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0))
        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : allWorlds;

  const totalPages = Math.ceil(total / pageSize);

  return {
    selectedScope: searchScope,
    setSelectedScope: handleScopeChange,
    selectedTheme,
    selectedStatus,
    setSelectedStatus: handleStatusChange,
    searchQuery,
    setSearchQuery: handleSearchChange,
    handleSearch,
    handleThemeChange,
    worlds,
    myWorlds,
    isLoading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
  };
}
