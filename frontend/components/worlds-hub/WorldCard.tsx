"use client";

import { useRouter } from "next/navigation";
import { Calendar, Play, Eye, TrendingUp } from "lucide-react";
import ActionButton from "@/components/shared/ActionButton";
import { THEME_OPTIONS } from "@/constants/game-themes";

interface WorldCardProps {
  world: {
    id: string;
    name: string;
    theme: string;
    status: string;
    quest?: string;
    createdAt: string;
    updatedAt?: string;
    isPublic?: boolean;
    views?: number;
    rating?: number;
  };
  scope: "my" | "global";
}

export default function WorldCard({ world, scope }: WorldCardProps) {
  const router = useRouter();
  const themeOption = THEME_OPTIONS.find((t) => t.value === world.theme);
  const ThemeIcon = themeOption?.icon;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "completed":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default:
        return "bg-muted/50 text-muted-foreground border-border";
    }
  };

  const getThemeGradient = (theme: string) => {
    switch (theme) {
      case "fantasy":
        return "from-purple-500/10 via-transparent to-transparent";
      case "norse-mythology":
        return "from-blue-500/10 via-transparent to-transparent";
      case "cyberpunk":
        return "from-pink-500/10 via-transparent to-transparent";
      case "steampunk":
        return "from-amber-500/10 via-transparent to-transparent";
      case "post-apocalyptic":
        return "from-red-500/10 via-transparent to-transparent";
      default:
        return "from-primary/10 via-transparent to-transparent";
    }
  };

  const handleViewWorld = () => {
    router.push(`/worlds/${world.id}`);
  };

  const handlePlayWorld = () => {
    router.push(`/worlds/${world.id}/play`);
  };

  return (
    <div
      className={`border-border bg-card/50 group relative overflow-hidden rounded-xl border backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-lg`}
    >
      {/* Theme gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100 ${getThemeGradient(world.theme)}`}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              {ThemeIcon && (
                <ThemeIcon className="text-primary h-4 w-4 flex-shrink-0" />
              )}
              <span className="text-primary text-xs font-semibold uppercase tracking-wider">
                {themeOption?.label || world.theme}
              </span>
            </div>
            <h3 className="text-foreground line-clamp-2 text-xl font-bold leading-tight">
              {world.name}
            </h3>
          </div>

          {/* Status badge */}
          <div
            className={`flex-shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(world.status)}`}
          >
            {world.status.charAt(0).toUpperCase() + world.status.slice(1)}
          </div>
        </div>

        {/* Quest snippet */}
        {world.quest && (
          <p className="text-muted-foreground mb-4 line-clamp-2 text-sm leading-relaxed">
            {world.quest}
          </p>
        )}

        {/* Metadata */}
        <div className="mb-4 flex flex-wrap items-center gap-4 text-xs">
          <div className="text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              {new Date(world.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {scope === "global" && world.views !== undefined && (
            <div className="text-muted-foreground flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{world.views} views</span>
            </div>
          )}

          {scope === "global" && world.rating !== undefined && (
            <div className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{world.rating.toFixed(1)} rating</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ActionButton
            variant="default"
            size="sm"
            onClick={handleViewWorld}
            className="flex-1"
          >
            View World
          </ActionButton>
          {scope === "my" && world.status !== "draft" && (
            <ActionButton
              variant="outline"
              size="sm"
              onClick={handlePlayWorld}
              icon={<Play className="h-4 w-4" />}
            >
              Play
            </ActionButton>
          )}
        </div>
      </div>
    </div>
  );
}
