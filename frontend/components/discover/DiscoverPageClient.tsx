"use client";

import { useDiscoverLogic } from "@/hooks/useDiscoverLogic";
import FeaturedWorldHero from "./FeaturedWorldHero";
import NewsFeed from "./NewsFeed";
import DiscoverSearch from "./DiscoverSearch";
import DiscoverFilters from "./DiscoverFilters";
import HighestRatedWorlds from "./HighestRatedWorlds";
import TrendingWorlds from "./TrendingWorlds";
import RecentWorlds from "./RecentWorlds";
import AllWorldsGrid from "./AllWorldsGrid";
import LoadingState from "./LoadingState";
import GlobalLoading from "@/components/shared/LoadingStates/GlobalLoading";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function DiscoverPageClient() {
  const {
    selectedTheme,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    activeSearchQuery,
    setSearchQuery,
    handleSearch,
    handleThemeChange,
    viewMode,
    setViewMode,
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
  } = useDiscoverLogic();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Featured World Hero */}
        {!activeSearchQuery && (
          <>
            {isFeaturedLoading ? (
              <div className="mb-12 h-[500px] animate-pulse rounded-3xl bg-card" />
            ) : (
              <div className="mb-12">
                <FeaturedWorldHero world={featuredWorld} />
              </div>
            )}
          </>
        )}

        {/* Search Bar */}
        <DiscoverSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
        />

        {/* News Feed */}
        {!activeSearchQuery && <NewsFeed />}

        {/* Highest Rated Section */}
        {!activeSearchQuery && (
          <>
            {isHighestRatedLoading ? (
              <div className="py-12">
                <GlobalLoading
                  message="Loading highest rated worlds..."
                  fullScreen={false}
                />
              </div>
            ) : (
              <HighestRatedWorlds worlds={highestRatedWorlds} />
            )}
          </>
        )}

        {/* Trending Section */}
        {!activeSearchQuery && (
          <>
            {isTrendingLoading ? (
              <div className="py-12">
                <GlobalLoading message="Loading trending worlds..." fullScreen={false} />
              </div>
            ) : (
              <TrendingWorlds worlds={trendingWorlds} />
            )}
          </>
        )}

        {/* Recently Created Section */}
        {!activeSearchQuery && (
          <>
            {isRecentLoading ? (
              <div className="py-12">
                <GlobalLoading message="Loading recent worlds..." fullScreen={false} />
              </div>
            ) : (
              <RecentWorlds worlds={recentWorlds} />
            )}
          </>
        )}

        {/* Divider */}
        <div className="my-16">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Browse All Worlds
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="py-6">
          <DiscoverFilters
            selectedTheme={selectedTheme}
            selectedStatus={selectedStatus}
            onThemeChange={handleThemeChange}
            onStatusChange={setSelectedStatus}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {/* All Worlds Grid */}
        <div className="py-6">
          <h2 className="mb-6 text-2xl font-bold">
            {activeSearchQuery ? "Search Results" : "Complete Catalog"}
          </h2>

          {isAllWorldsLoading ? (
            <LoadingState />
          ) : error ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <p className="text-destructive mb-2 text-lg font-semibold">
                  Error loading worlds
                </p>
                <p className="text-muted-foreground text-sm">
                  {error instanceof Error ? error.message : "Something went wrong"}
                </p>
              </div>
            </div>
          ) : (
            <>
              <AllWorldsGrid worlds={allWorlds} viewMode={viewMode} />

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      if (totalPages <= 5) return i + 1;
                      if (currentPage <= 3) return i + 1;
                      if (currentPage >= totalPages - 2) return totalPages - 4 + i;
                      return currentPage - 2 + i;
                    }).map((page) => (
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
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
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
        </div>
      </div>
    </main>
  );
}
