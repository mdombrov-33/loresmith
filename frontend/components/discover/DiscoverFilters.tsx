"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { THEME_OPTIONS } from "@/constants/game-themes";
import { STATUS_OPTIONS, SORT_OPTIONS } from "@/constants/hub-filters";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiscoverFiltersProps {
  selectedTheme: string;
  selectedStatus: string;
  selectedSort: string;
  onThemeChange: (theme: string) => void;
  onStatusChange: (status: string) => void;
  onSortChange: (sort: string) => void;
  viewMode: "grid" | "row";
  onViewModeChange: (mode: "grid" | "row") => void;
}

export default function DiscoverFilters({
  selectedTheme,
  selectedStatus,
  selectedSort,
  onThemeChange,
  onStatusChange,
  onSortChange,
  viewMode,
  onViewModeChange,
}: DiscoverFiltersProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Theme Filter */}
        <Select
          value={selectedTheme || "all"}
          onValueChange={(val) => onThemeChange(val === "all" ? "" : val)}
        >
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
        <Select
          value={selectedStatus || "all"}
          onValueChange={(val) => onStatusChange(val === "all" ? "" : val)}
        >
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

        {/* Sort By */}
        <Select
          value={selectedSort || "default"}
          onValueChange={(val) => onSortChange(val === "default" ? "" : val)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default Order</SelectItem>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-1">
        <Button
          variant={viewMode === "grid" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("grid")}
          className="h-8 w-8 p-0"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "row" ? "default" : "ghost"}
          size="sm"
          onClick={() => onViewModeChange("row")}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
