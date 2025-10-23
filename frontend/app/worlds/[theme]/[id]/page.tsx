"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Loader2,
  Compass,
  Wand2,
  Home,
  BookOpen,
  ScrollText,
  Sparkles,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useWorld } from "@/lib/queries";
import { useTheme } from "next-themes";
import { useAppStore } from "@/stores/appStore";
import { THEMES } from "@/constants/game-themes";
import { FullStory } from "@/types/api";

export default function WorldPage() {
  const params = useParams();
  const router = useRouter();
  const themeParamRaw = params?.theme;
  const idParamRaw = params?.id;
  const themeParam = Array.isArray(themeParamRaw)
    ? themeParamRaw[0]
    : themeParamRaw || "fantasy";
  const idParam = Array.isArray(idParamRaw) ? idParamRaw[0] : idParamRaw;

  const urlToThemeMap: Record<string, string> = {
    fantasy: THEMES.FANTASY,
    norse: THEMES.NORSE,
    cyberpunk: THEMES.CYBERPUNK,
    "post-apoc": THEMES.POST_APOCALYPTIC,
    steampunk: THEMES.STEAMPUNK,
  };

  const actualTheme = urlToThemeMap[themeParam] || themeParam;

  const { setTheme: setNextTheme } = useTheme();
  const { setAppStage, setTheme: setStoreTheme, isHydrated } = useAppStore();

  const displayNames: Record<string, string> = {
    characters: "Character",
    factions: "Faction",
    settings: "Setting",
    events: "Event",
    relics: "Relic",
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const sortDetails = (details: Record<string, unknown>) => {
    const order = [
      "appearance",
      "personality",
      "creativity",
      "empathy",
      "influence",
      "lore_mastery",
      "perception",
      "resilience",
      "health",
      "stress",
      "skills",
    ];

    return Object.entries(details).sort(([a], [b]) => {
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  };

  const worldId = idParam ? Number(idParam) : NaN;
  const { data: storyData, isLoading, error } = useWorld(worldId);

  const parsedStory: FullStory = storyData
    ? JSON.parse(storyData.full_story)
    : {};

  useEffect(() => {
    setAppStage("story");
    return () => setAppStage("home");
  }, [setAppStage]);

  useEffect(() => {
    if (!isHydrated) return;

    if (!idParam || isNaN(worldId)) {
      router.replace("/");
      return;
    }

    if (typeof actualTheme === "string") {
      setStoreTheme(actualTheme);
      setNextTheme(actualTheme);
    }
  }, [
    idParam,
    actualTheme,
    isHydrated,
    router,
    setStoreTheme,
    setNextTheme,
    worldId,
  ]);

  const themeMismatch = storyData?.theme && storyData.theme !== actualTheme;
  const displayError = error
    ? error.message || "Failed to load world"
    : themeMismatch
      ? `This world was created with the "${storyData.theme}" theme, not "${actualTheme}". Please use the correct theme in the URL.`
      : null;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading your world...</p>
        </div>
      </div>
    );
  }

  if (displayError || !storyData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              {displayError || "The requested world could not be found."}
            </p>
            <Button asChild>
              <Link href="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const paragraphs = (parsedStory.content ?? "").split("\n\n").filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mb-4 flex justify-center">
          <div className="bg-primary/10 border-primary flex h-20 w-20 items-center justify-center rounded-full border-2">
            <Compass className="text-primary h-10 w-10" />
          </div>
        </div>
        <h1 className="mb-4 text-5xl font-bold">{parsedStory.quest?.title}</h1>
      </div>

      {/* Quest Description */}
      <Card className="border-primary/50 mx-auto mb-8 max-w-4xl shadow-lg">
        <CardHeader className="bg-primary/5">
          <div className="flex items-start gap-3">
            <BookOpen className="text-primary mt-1 h-6 w-6 flex-shrink-0" />
            <div className="flex-1">
              <CardContent className="p-0 text-base">
                {parsedStory.quest?.description}
              </CardContent>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Full Story Content */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary h-5 w-5" />
              <CardTitle className="text-2xl">Full Story</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-base leading-relaxed">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph: string, index: number) => (
                  <p key={index} className="text-foreground">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-muted-foreground">
                  No story content available.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Selected Lore Pieces */}
        <Card className="p-6">
          <CardTitle className="mb-4 flex items-center gap-2 text-xl">
            <ScrollText className="text-primary h-5 w-5" />
            Your World
          </CardTitle>
          <div className="grid gap-4 md:grid-cols-2">
            {storyData?.lore_pieces?.map((piece) => (
              <Card key={piece.id} className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">
                    {displayNames[piece.type] ||
                      piece.type.charAt(0).toUpperCase() + piece.type.slice(1)}
                  </Badge>
                  <span className="font-bold">{piece.name}</span>
                </div>
                <div className="text-muted-foreground mb-2 text-sm">
                  {truncateText(piece.description)}
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80 h-auto p-0"
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Read More
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Badge variant="outline">
                          {displayNames[piece.type] ||
                            piece.type.charAt(0).toUpperCase() +
                              piece.type.slice(1)}
                        </Badge>
                        {piece.name}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="mb-2 font-semibold">Description</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {piece.description}
                        </p>
                      </div>
                      {piece.details &&
                        Object.keys(piece.details).length > 0 && (
                          <div>
                            <h4 className="mb-4 font-semibold">Details</h4>
                            <div className="space-y-3">
                              {sortDetails(piece.details).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="bg-muted/50 rounded-lg p-3"
                                  >
                                    <div className="space-y-2">
                                      <span className="text-sm font-medium capitalize">
                                        {key.replace(/_/g, " ")}:
                                      </span>
                                      <p className="text-muted-foreground text-sm leading-relaxed">
                                        {String(value)}
                                      </p>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </DialogContent>
                </Dialog>
              </Card>
            ))}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-6 pt-8">
          <Button size="lg" className="h-14 gap-2 px-8 text-lg">
            <Compass className="h-5 w-5" />
            Begin Adventure
          </Button>

          <div className="flex justify-center gap-4">
            <Button variant="outline" size="lg" className="gap-2" asChild>
              <Link href={`/generate?theme=${actualTheme}`}>
                <Wand2 className="h-4 w-4" />
                Create New Story
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="gap-2" asChild>
              <Link href="/">
                <Home className="h-4 w-4" />
                Return Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
