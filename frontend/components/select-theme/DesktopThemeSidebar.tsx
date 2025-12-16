import { THEME_OPTIONS } from "@/constants/game-themes";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface DesktopThemeSidebarProps {
  selectedTheme: string;
  onThemeSelect: (theme: string) => void;
}

export default function DesktopThemeSidebar({
  selectedTheme,
  onThemeSelect,
}: DesktopThemeSidebarProps) {
  return (
    <aside className="border-border bg-card/50 hidden h-screen w-80 flex-col border-r backdrop-blur-sm lg:flex">
      {/* Header */}
      <div className="border-border border-b p-6">
        <h1 className="font-heading mb-2 text-2xl font-bold">
          Choose Your World
        </h1>
        <p className="text-muted-foreground text-sm">
          Select a theme to begin your journey
        </p>
      </div>

      {/* Theme List */}
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {THEME_OPTIONS.map((theme) => {
          const Icon = theme.icon;
          const isSelected = selectedTheme === theme.value;

          return (
            <button
              key={theme.value}
              onClick={() => onThemeSelect(theme.value)}
              className={cn(
                "group relative w-full overflow-hidden rounded-lg border p-4 text-left transition-all duration-300",
                isSelected
                  ? "border-primary bg-primary/10 shadow-primary/20 scale-105 shadow-lg"
                  : "border-border bg-card hover:border-primary/50 hover:bg-card/80 hover:shadow-md",
              )}
            >
              {/* Subtle gradient shine on hover (non-selected) */}
              {!isSelected && (
                <div className="via-primary/5 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              )}

              {/* Content */}
              <div className="relative z-10 flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                    isSelected
                      ? "bg-primary/20"
                      : "bg-primary/10 group-hover:bg-primary/15",
                  )}
                >
                  <Icon className="text-primary h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-foreground font-semibold">
                    {theme.label}
                  </h3>
                </div>
                {isSelected && (
                  <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full">
                    <Check className="text-primary-foreground h-4 w-4" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
