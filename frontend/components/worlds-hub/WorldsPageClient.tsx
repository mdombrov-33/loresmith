"use client";

import { useWorldsHubLogic } from "@/hooks/useWorldsHubLogic";
import WorldsStats from "@/components/worlds-hub/WorldsStats";
import QuickActions from "@/components/worlds-hub/QuickActions";
import WorldsTable from "@/components/worlds-hub/WorldsTable";
import SearchFilters from "@/components/worlds-hub/SearchFilters";
import SearchBar from "@/components/worlds-hub/SearchBar";
import SearchResults from "@/components/worlds-hub/SearchResults";
import SearchLoading from "@/components/worlds-hub/SearchLoading";
import SearchError from "@/components/worlds-hub/SearchError";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function WorldsPageClient() {
  const {
    selectedScope,
    setSelectedScope,
    selectedTheme,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    handleSearch,
    handleThemeChange,
    worlds,
    myWorlds,
    isLoading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useWorldsHubLogic();

  return (
    <main className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-4xl font-bold">World Hub</h1>
          <p className="text-muted-foreground text-lg">
            Manage your worlds, discover new adventures, and track your active
            sessions
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          value={selectedScope}
          onValueChange={(value) => setSelectedScope(value as "my" | "global")}
          className="w-full"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="my" className="px-8">
              My Hub
            </TabsTrigger>
            <TabsTrigger value="global" className="px-8">
              Discover
            </TabsTrigger>
          </TabsList>

          {/* MY HUB TAB - Dashboard Layout */}
          <TabsContent value="my" className="mt-0 space-y-6">
            {/* Quick Actions */}
            <QuickActions myWorlds={myWorlds} />

            {/* Stats */}
            <WorldsStats myWorlds={myWorlds} scope="my" />

            {/* Filter Bar - Minimal */}
            <div className="flex items-center gap-4">
              <Select
                value={selectedStatus || "all"}
                onValueChange={(val) => setSelectedStatus(val === "all" ? "" : val)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-sm">
                {worlds.length} {worlds.length === 1 ? "world" : "worlds"}
              </p>
            </div>

            {/* Worlds Table */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="border-border bg-card/50 h-24 animate-pulse rounded-lg border"
                  />
                ))}
              </div>
            ) : error ? (
              <SearchError error={error} />
            ) : (
              <>
                <WorldsTable worlds={worlds} isLoading={isLoading} />
                {totalPages > 1 && (
                  <Pagination className="mt-6">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                      {Array.from(
                        { length: Math.min(totalPages, 5) },
                        (_, i) => {
                          if (totalPages <= 5) return i + 1;
                          if (currentPage <= 3) return i + 1;
                          if (currentPage >= totalPages - 2)
                            return totalPages - 4 + i;
                          return currentPage - 2 + i;
                        },
                      ).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1),
                            )
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="global" className="mt-0 space-y-6">
            {/* Search */}
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearch={handleSearch}
              isLoading={isLoading}
            />

            {/* Filters */}
            <SearchFilters
              selectedTheme={selectedTheme}
              selectedStatus={selectedStatus}
              onThemeChange={handleThemeChange}
              onStatusChange={setSelectedStatus}
            />

            {/* Results */}
            {isLoading ? (
              <SearchLoading />
            ) : error ? (
              <SearchError error={error} />
            ) : (
              <>
                <SearchResults worlds={worlds} scope={selectedScope} />
                {totalPages > 1 && (
                  <Pagination className="mt-6">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ),
                      )}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1),
                            )
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
