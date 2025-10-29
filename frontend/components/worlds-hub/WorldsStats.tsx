"use client";

import { World } from "@/types/api";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Sparkles, Users, Eye } from "lucide-react";

interface WorldsStatsProps {
  myWorlds: World[];
  scope: "my" | "global";
}

export default function WorldsStats({ myWorlds, scope }: WorldsStatsProps) {
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

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border bg-card/50 backdrop-blur-sm transition-all hover:bg-card">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="bg-primary/10 text-primary rounded-lg p-3">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Total Worlds</p>
            <p className="text-foreground text-2xl font-bold">{totalWorlds}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card/50 backdrop-blur-sm transition-all hover:bg-card">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="bg-green-500/10 rounded-lg p-3 text-green-500">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Active Worlds</p>
            <p className="text-foreground text-2xl font-bold">{activeWorlds}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card/50 backdrop-blur-sm transition-all hover:bg-card">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="bg-blue-500/10 rounded-lg p-3 text-blue-500">
            <Eye className="h-6 w-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Published</p>
            <p className="text-foreground text-2xl font-bold">
              {publishedWorlds}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card/50 backdrop-blur-sm transition-all hover:bg-card">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="bg-purple-500/10 rounded-lg p-3 text-purple-500">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Active Players</p>
            <p className="text-foreground text-2xl font-bold">
              {activeSessions}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
