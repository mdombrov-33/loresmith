"use client";

import { useRouter } from "next/navigation";
import { THEME_OPTIONS } from "@/constants/game-themes";
import { Play } from "lucide-react";
import { World } from "@/lib/schemas";
import ActionButton from "@/components/shared/ActionButton";
import { useAppStore } from "@/stores/appStore";

interface MyHubActionsProps {
  myWorlds: World[];
}

export default function MyHubActions({ myWorlds }: MyHubActionsProps) {
  const router = useRouter();
  const { setTheme } = useAppStore();

  const lastActiveWorld = myWorlds
    .filter((w) => w.session_id)
    .sort((a, b) => {
      const aDate = new Date(a.updated_at || 0);
      const bDate = new Date(b.updated_at || 0);
      return bDate.getTime() - aDate.getTime();
    })[0];

  const lastActiveWorldTitle = lastActiveWorld
    ? (() => {
        try {
          const fullStory = JSON.parse(lastActiveWorld.full_story);
          return fullStory?.quest?.title || "Your Adventure";
        } catch {
          return "Your Adventure";
        }
      })()
    : null;

  const getThemeGradient = (theme: string) => {
    switch (theme) {
      case "fantasy":
        return "from-purple-500/20 to-pink-500/20";
      case "norse-mythology":
        return "from-blue-500/20 to-cyan-500/20";
      case "cyberpunk":
        return "from-pink-500/20 to-cyan-500/20";
      case "steampunk":
        return "from-amber-500/20 to-orange-500/20";
      case "post-apocalyptic":
        return "from-red-500/20 to-orange-500/20";
      default:
        return "from-primary/20 to-primary/10";
    }
  };

  const getBorderColor = (theme: string) => {
    switch (theme) {
      case "fantasy":
        return "border-purple-500/30 hover:border-purple-500/50";
      case "norse-mythology":
        return "border-blue-500/30 hover:border-blue-500/50";
      case "cyberpunk":
        return "border-pink-500/30 hover:border-pink-500/50";
      case "steampunk":
        return "border-amber-500/30 hover:border-amber-500/50";
      case "post-apocalyptic":
        return "border-red-500/30 hover:border-red-500/50";
      default:
        return "border-primary/30 hover:border-primary/50";
    }
  };

  const handleContinueAdventure = () => {
    if (lastActiveWorld?.session_id) {
      router.push(`/adventure/${lastActiveWorld.session_id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Continue Adventure - if exists */}
      {lastActiveWorld && (
        <div className="border-primary/30 bg-card/50 group relative overflow-hidden rounded-xl border p-6 backdrop-blur-sm">
          <div
            className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100 ${getThemeGradient(lastActiveWorld.theme)}`}
          />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <div className="text-primary mb-1 text-xs font-semibold uppercase tracking-wider">
                Continue Your Adventure
              </div>
              <div className="text-foreground text-xl font-bold">
                {lastActiveWorldTitle}
              </div>
            </div>
            <ActionButton
              size="lg"
              onClick={handleContinueAdventure}
              icon={<Play className="h-5 w-5" />}
              className="flex-shrink-0"
            >
              Resume
            </ActionButton>
          </div>
        </div>
      )}

      {/* Create New World */}
      <div>
        <h2 className="text-foreground mb-4 text-lg font-semibold">
          Start a New World
        </h2>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {THEME_OPTIONS.map((theme) => {
            const Icon = theme.icon;
            return (
              <button
                key={theme.value}
                onClick={() => {
                  setTheme(theme.value);
                  router.push(`/generate?theme=${theme.value}`);
                }}
                className={`group relative overflow-hidden rounded-xl border ${getBorderColor(theme.value)} bg-card/50 p-4 text-left backdrop-blur-sm transition-all hover:scale-105 hover:shadow-lg`}
              >
                {/* Background gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100 ${getThemeGradient(theme.value)}`}
                />

                <div className="relative">
                  <Icon className="text-primary mb-3 h-6 w-6" />
                  <div className="text-foreground text-sm font-semibold">
                    {theme.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
