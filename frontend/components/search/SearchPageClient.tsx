"use client";

import { useSearchLogic } from "@/hooks/useSearchLogic";
import SearchFilters from "@/components/search/SearchFilters";
import SearchScopeSelector from "@/components/search/SearchScopeSelector";
import SearchBar from "@/components/search/SearchBar";
import SearchResults from "@/components/search/SearchResults";
import SearchLoading from "@/components/search/SearchLoading";
import SearchError from "@/components/search/SearchError";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function SearchPageClient() {
  const {
    selectedScope,
    setSelectedScope,
    selectedTheme,
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    handleThemeChange,
    worlds,
    isLoading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useSearchLogic();

  return (
    <main className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <SearchFilters
              selectedTheme={selectedTheme}
              selectedStatus={selectedStatus}
              onThemeChange={handleThemeChange}
              onStatusChange={setSelectedStatus}
            />
          </aside>
          <section className="lg:col-span-3">
            <SearchScopeSelector
              selectedScope={selectedScope}
              onScopeChange={setSelectedScope}
            />
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
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
          </section>
        </div>
      </div>
    </main>
  );
}
