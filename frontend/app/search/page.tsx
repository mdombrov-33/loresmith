"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useWorlds } from "@/lib/queries";
import { THEME_OPTIONS } from "@/constants/game-themes";
import { World } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/stores/appStore";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "adventure", label: "Adventure" },
];

const LORE_TYPE_OPTIONS = [
  { value: "character", label: "Character" },
  { value: "faction", label: "Faction" },
  { value: "setting", label: "Setting" },
  { value: "event", label: "Event" },
  { value: "relic", label: "Relic" },
];

export default function SearchPage() {
  const { setAppStage, setTheme } = useAppStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlTheme = searchParams.get("theme");
  const [selectedScope, setSelectedScope] = useState<"my" | "global">("my");
  const [selectedTheme, setSelectedTheme] = useState<string>(urlTheme || "");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    setAppStage("search");
  }, [setAppStage]);

  useEffect(() => {
    const themeFromQuery = searchParams.get("theme");
    if (themeFromQuery) {
      setTheme(themeFromQuery);
      // Removed setNextTheme to freeze visual theme during search
    }
  }, [searchParams, setTheme]);

  useEffect(() => {
    if (urlTheme !== selectedTheme) {
      setSelectedTheme(urlTheme || "");
    }
  }, [urlTheme, selectedTheme]);

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    if (theme) {
      setTheme(theme);
    }
    const params = new URLSearchParams(searchParams.toString());
    if (theme) {
      params.set("theme", theme);
    } else {
      params.delete("theme");
    }
    router.replace(`/search?${params.toString()}`);
  };

  const {
    data: worlds = [],
    isLoading,
    error,
  } = useWorlds({
    scope: selectedScope,
    theme: selectedTheme || undefined,
    status: selectedStatus || undefined,
  });

  const filteredWorlds = worlds.filter((world: World) => {
    if (searchQuery) {
      const fullStory = JSON.parse(world.full_story);
      const searchableText = [
        fullStory.title,
        fullStory.content,
        fullStory.theme,
        fullStory.quest?.title,
        fullStory.quest?.description,
      ]
        .join(" ")
        .toLowerCase();
      return searchableText.includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
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
                    <Button
                      variant={selectedTheme === "" ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleThemeChange("")}
                    >
                      All Themes
                    </Button>
                    {THEME_OPTIONS.map((theme) => (
                      <Button
                        key={theme.value}
                        variant={
                          selectedTheme === theme.value ? "default" : "outline"
                        }
                        size="sm"
                        className={`w-full justify-start ${selectedTheme === theme.value ? theme.value : ""}`}
                        onClick={() => handleThemeChange(theme.value)}
                      >
                        <theme.icon className="mr-2 h-4 w-4" />
                        {theme.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Status Filter */}
                <div>
                  <h3 className="mb-3 font-medium">Status</h3>
                  <div className="space-y-2">
                    <Button
                      variant={selectedStatus === "" ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedStatus("")}
                    >
                      All Statuses
                    </Button>
                    {STATUS_OPTIONS.map((status) => (
                      <Button
                        key={status.value}
                        variant={
                          selectedStatus === status.value
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSelectedStatus(status.value)}
                      >
                        {status.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Lore Type Filter - Placeholder */}
                <div>
                  <h3 className="mb-3 font-medium">Lore Type</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      disabled
                    >
                      Coming Soon
                    </Button>
                    {LORE_TYPE_OPTIONS.map((type) => (
                      <Button
                        key={type.value}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        disabled
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Scope Selector */}
            <div className="mb-6">
              <div className="flex gap-2">
                <Button
                  variant={selectedScope === "my" ? "default" : "outline"}
                  onClick={() => {
                    setSelectedScope("my");
                  }}
                >
                  My Worlds
                </Button>
                <Button
                  variant={selectedScope === "global" ? "default" : "outline"}
                  onClick={() => setSelectedScope("global")}
                >
                  Global Worlds
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Search worlds... (placeholder - semantic search coming soon)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  disabled
                />
              </div>
            </div>

            {/* Results */}
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="transition-shadow hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-5 w-12" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="mb-2 h-4 w-full" />
                      <Skeleton className="mb-2 h-4 w-5/6" />
                      <Skeleton className="mb-4 h-4 w-4/6" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <p className="text-destructive">
                  Error loading worlds: {error?.message || "Unknown error"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredWorlds.map((world: World) => {
                  const fullStory = JSON.parse(world.full_story);
                  return (
                    <Card
                      key={world.id}
                      className="transition-shadow hover:shadow-lg"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="line-clamp-2 text-lg">
                            {fullStory.quest?.title || "Untitled World"}
                          </CardTitle>
                          <Badge variant="secondary">
                            {world.status.charAt(0).toUpperCase() +
                              world.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {THEME_OPTIONS.find((t) => t.value === world.theme)
                              ?.label || world.theme}
                          </Badge>
                          {world.user_name && (
                            <Badge variant="outline" className="text-xs">
                              by {world.user_name}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
                          {fullStory.content || "No description available"}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-xs">
                            {new Date(world.created_at).toLocaleDateString()}
                          </span>
                          <Button asChild size="sm">
                            <Link href={`/worlds/${world.theme}/${world.id}`}>
                              View World
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {filteredWorlds.length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-muted-foreground">No worlds found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
