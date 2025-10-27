import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
  onSearch,
  isLoading = false,
}: SearchBarProps) {
  return (
    <section className="mb-6">
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Search worlds... e.g., 'Desert oasis with ancient pyramids' or 'Erik Magnusson'"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={onSearch}
          disabled={isLoading || !searchQuery.trim()}
          className="px-4"
        >
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>
    </section>
  );
}
