import { THEME_OPTIONS } from "@/constants/game-themes";
import { cn } from "@/lib/utils";

interface MobileThemeSelectorProps {
  selectedTheme: string;
  onThemeSelect: (theme: string) => void;
}

export default function MobileThemeSelector({
  selectedTheme,
  onThemeSelect,
}: MobileThemeSelectorProps) {
  return (
    <div className="border-border bg-card/95 border-b px-4 py-4 backdrop-blur-sm lg:hidden">
      <h2 className="text-foreground mb-3 text-sm font-semibold">
        Select Theme
      </h2>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-primary/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        {THEME_OPTIONS.map((theme) => {
          const Icon = theme.icon;
          const isSelected = selectedTheme === theme.value;

          return (
            <button
              key={theme.value}
              onClick={() => onThemeSelect(theme.value)}
              className={cn(
                "flex flex-shrink-0 items-center gap-2 rounded-full border px-4 py-2 transition-all",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-lg"
                  : "border-border bg-card text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="whitespace-nowrap text-sm font-medium">
                {theme.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
