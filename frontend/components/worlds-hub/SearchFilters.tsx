import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ActionButton from "@/components/shared/ActionButton";
import { Separator } from "@/components/ui/separator";
import { Filter } from "lucide-react";
import { THEME_OPTIONS } from "@/constants/game-themes";
import { STATUS_OPTIONS, LORE_TYPE_OPTIONS } from "@/constants/search";

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Filter */}
        <div>
          <h3 className="mb-3 font-medium">Theme</h3>
          <div className="space-y-2">
            <ActionButton
              variant={selectedTheme === "" ? "default" : "outline"}
              size="sm"
              className="w-full justify-start"
              onClick={() => onThemeChange("")}
            >
              All Themes
            </ActionButton>
            {THEME_OPTIONS.map((theme) => (
              <ActionButton
                key={theme.value}
                variant={selectedTheme === theme.value ? "default" : "outline"}
                size="sm"
                className={`w-full justify-start ${selectedTheme === theme.value ? theme.value : ""}`}
                onClick={() => onThemeChange(theme.value)}
                icon={<theme.icon className="h-4 w-4" />}
              >
                {theme.label}
              </ActionButton>
            ))}
          </div>
        </div>

        <Separator />

        {/* Status Filter */}
        <div>
          <h3 className="mb-3 font-medium">Status</h3>
          <div className="space-y-2">
            <ActionButton
              variant={selectedStatus === "" ? "default" : "outline"}
              size="sm"
              className="w-full justify-start"
              onClick={() => onStatusChange("")}
            >
              All Statuses
            </ActionButton>
            {STATUS_OPTIONS.map((status) => (
              <ActionButton
                key={status.value}
                variant={
                  selectedStatus === status.value ? "default" : "outline"
                }
                size="sm"
                className="w-full justify-start"
                onClick={() => onStatusChange(status.value)}
              >
                {status.label}
              </ActionButton>
            ))}
          </div>
        </div>

        <Separator />

        {/* Lore Type Filter - Placeholder */}
        <div>
          <h3 className="mb-3 font-medium">Lore Type</h3>
          <div className="space-y-2">
            <ActionButton
              variant="outline"
              size="sm"
              className="w-full justify-start"
              disabled
            >
              Coming Soon
            </ActionButton>
            {LORE_TYPE_OPTIONS.map((type) => (
              <ActionButton
                key={type.value}
                variant="outline"
                size="sm"
                className="w-full justify-start"
                disabled
              >
                {type.label}
              </ActionButton>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
