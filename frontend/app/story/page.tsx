"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Compass,
  Wand2,
  Home,
  BookOpen,
  ScrollText,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { generateFullStory } from "@/lib/api";
import { FullStoryResponse } from "@/types/api";
import { useAppStore } from "@/stores/appStore";

export default function StoryPage() {
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme") || "fantasy";

  const { setAppStage, selectedLore, isHydrated } = useAppStore();

  const [storyData, setStoryData] = useState<FullStoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAppStage("story");
    return () => setAppStage("home");
  }, [setAppStage]);

  useEffect(() => {
    if (!isHydrated) return;

    const loadStory = async () => {
      try {
        if (!selectedLore || Object.keys(selectedLore).length === 0) {
          throw new Error("No selection found. Please create a new story.");
        }

        const response = await generateFullStory(selectedLore, theme);
        setStoryData(response);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to generate story",
        );
      } finally {
        setLoading(false);
      }
    };

    loadStory();
  }, [theme, selectedLore, isHydrated]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-24">
          <div className="bg-primary/10 border-primary mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2">
            <Loader2 className="text-primary h-10 w-10 animate-spin" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">
            AI is creating your world...
          </h2>
          <p className="text-muted-foreground max-w-md text-center">
            Weaving together your selections into an epic narrative.
          </p>
        </div>
      </div>
    );
  }

  if (error || !storyData) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="border-destructive mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardContent className="pt-0">
              <p>{error || "Failed to load story"}</p>
              <div className="mt-4 flex gap-4">
                <Button variant="outline" asChild>
                  <Link href="/">Return Home</Link>
                </Button>
                <Button asChild>
                  <Link href={`/generate?theme=${theme}`}>
                    Create New Story
                  </Link>
                </Button>
              </div>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { story } = storyData;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mb-4 flex justify-center">
          <div className="bg-primary/10 border-primary flex h-20 w-20 items-center justify-center rounded-full border-2">
            <Compass className="text-primary h-10 w-10" />
          </div>
        </div>
        <h1 className="mb-4 text-5xl font-bold">{story.quest.title}</h1>
      </div>

      {/* Quest Description */}
      <Card className="border-primary/50 mx-auto mb-8 max-w-4xl shadow-lg">
        <CardHeader className="bg-primary/5">
          <div className="flex items-start gap-3">
            <BookOpen className="text-primary mt-1 h-6 w-6 flex-shrink-0" />
            <div className="flex-1">
              <CardContent className="p-0 text-base">
                {story.quest.description}
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
              {story.content.split("\n\n").map((paragraph, index) => (
                <p key={index} className="text-foreground">
                  {paragraph}
                </p>
              ))}
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
            {Object.entries(selectedLore).map(([key, piece]) =>
              piece ? (
                <Card key={key} className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="outline">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Badge>
                    <span className="font-bold">{piece.name}</span>
                  </div>
                  <div className="text-muted-foreground line-clamp-3 text-sm">
                    {piece.description}
                  </div>
                </Card>
              ) : null,
            )}
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
              <Link href={`/generate?theme=${theme}`}>
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
