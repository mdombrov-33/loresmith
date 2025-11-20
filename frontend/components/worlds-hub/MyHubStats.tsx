"use client";

import { World } from "@/lib/schemas";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Sparkles, Users, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface MyHubStatsProps {
  myWorlds: World[];
  scope: "my" | "global";
}

export default function MyHubStats({ myWorlds, scope }: MyHubStatsProps) {
  const totalWorlds = myWorlds.length;
  const activeWorlds = myWorlds.filter((w) => w.status === "active").length;
  const publishedWorlds = myWorlds.filter(
    (w) => w.visibility === "published",
  ).length;
  const activeSessions = myWorlds.reduce(
    (sum, w) => sum + (w.active_sessions || 0),
    0,
  );

  if (scope === "global") {
    return null;
  }

  const stats = [
    {
      title: "Total Worlds",
      value: totalWorlds,
      change: null,
      changeType: null,
      icon: Globe,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      hoverBorderColor: "hover:border-blue-500/40",
      glowColor: "from-blue-500/50 to-blue-500/20",
    },
    {
      title: "Active Worlds",
      value: activeWorlds,
      change: null,
      changeType: null,
      icon: Sparkles,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      hoverBorderColor: "hover:border-green-500/40",
      glowColor: "from-green-500/50 to-green-500/20",
    },
    {
      title: "Published",
      value: publishedWorlds,
      change: null,
      changeType: null,
      icon: Eye,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      hoverBorderColor: "hover:border-purple-500/40",
      glowColor: "from-purple-500/50 to-purple-500/20",
    },
    {
      title: "Playing your worlds now",
      value: activeSessions,
      change: null,
      changeType: null,
      icon: Users,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      hoverBorderColor: "hover:border-orange-500/40",
      glowColor: "from-orange-500/50 to-orange-500/20",
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className={cn(
              "group relative overflow-hidden bg-card/50 shadow-md backdrop-blur-sm transition-all duration-500 hover:shadow-xl",
              stat.borderColor,
              stat.hoverBorderColor
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className={cn(
              "absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r blur-xl transition-all duration-500 group-hover:blur-lg",
              stat.glowColor
            )} />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-muted-foreground mb-1 text-sm font-medium">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-foreground text-3xl font-bold tracking-tight">
                      {stat.value.toLocaleString()}
                    </h3>
                  </div>
                </div>
                <div className={cn(
                  "rounded-lg p-3 shadow-lg transition-all duration-500 group-hover:shadow-xl",
                  stat.bgColor,
                  stat.color
                )}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
