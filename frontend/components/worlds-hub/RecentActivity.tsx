"use client";

import { World } from "@/lib/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Plus, Play, CheckCircle } from "lucide-react";
import { THEME_OPTIONS } from "@/constants/game-themes";

interface RecentActivityProps {
  myWorlds: World[];
}

export default function RecentActivity({ myWorlds }: RecentActivityProps) {
  const activities = myWorlds
    .map((world) => {
      const fullStory = world.full_story ? JSON.parse(world.full_story) : null;
      const themeOption = THEME_OPTIONS.find((t) => t.value === world.theme);

      const items = [];

      items.push({
        id: `created-${world.id}`,
        type: "created",
        icon: Plus,
        color: "text-blue-500",
        title: `Created "${fullStory?.quest?.title || "Untitled World"}"`,
        subtitle: `${themeOption?.label || world.theme} world`,
        timestamp: new Date(world.created_at),
      });

      if (world.session_id) {
        items.push({
          id: `session-${world.id}`,
          type: "session",
          icon: Play,
          color: "text-green-500",
          title: `Started adventure in "${fullStory?.quest?.title || "Untitled World"}"`,
          subtitle: "Adventure in progress",
          timestamp: new Date(world.updated_at || world.created_at),
        });
      }

      if (world.status === "completed") {
        items.push({
          id: `completed-${world.id}`,
          type: "completed",
          icon: CheckCircle,
          color: "text-purple-500",
          title: `Completed "${fullStory?.quest?.title || "Untitled World"}"`,
          subtitle: "Adventure finished",
          timestamp: new Date(world.updated_at || world.created_at),
        });
      }

      return items;
    })
    .flat()
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5); //* Show last 5 activities

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (activities.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div
                  className={`${activity.color} bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground text-sm font-medium">
                    {activity.title}
                  </p>
                  <p
                    className="text-muted-foreground text-xs"
                    suppressHydrationWarning
                  >
                    {activity.subtitle} •{" "}
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
