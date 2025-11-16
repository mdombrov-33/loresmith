import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { THEME_OPTIONS } from "@/constants/game-themes";
import { STATUS_OPTIONS } from "@/constants/search";

interface SearchFiltersProps {
  selectedTheme: string;
  selectedStatus: string;
  onThemeChange: (theme: string) => void;
  onStatusChange: (status: string) => void;
}

export default function SearchFilters({
  selectedTheme,
  selectedStatus,
  onThemeChange,
  onStatusChange,
}: SearchFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Theme Filter */}
      <Select value={selectedTheme || "all"} onValueChange={(val) => onThemeChange(val === "all" ? "" : val)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by theme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Themes</SelectItem>
          {THEME_OPTIONS.map((theme) => (
            <SelectItem key={theme.value} value={theme.value}>
              {theme.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={selectedStatus || "all"} onValueChange={(val) => onStatusChange(val === "all" ? "" : val)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {STATUS_OPTIONS.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Rating Filter - Placeholder */}
      <Select disabled>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Rating (Coming Soon)" />
        </SelectTrigger>
      </Select>

      {/* Active Players Filter - Placeholder */}
      <Select disabled>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Active Players (Soon)" />
        </SelectTrigger>
      </Select>
    </div>
  );
}
