"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStage } from "@/contexts/app-stage-context";
import { Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function StoryPage() {
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme") || "fantasy";
  const { setAppStage } = useAppStage();

  useEffect(() => {
    setAppStage("story");
    return () => setAppStage("home");
  }, [setAppStage]);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="mb-4 flex justify-center">
          <div className="bg-primary/10 border-primary flex h-20 w-20 items-center justify-center rounded-full border-2">
            <BookOpen className="text-primary h-10 w-10" />
          </div>
        </div>
        <h1 className="mb-4 text-5xl font-bold">Your Story</h1>
        <p className="text-muted-foreground text-lg">
          The complete narrative woven from your selections
        </p>
      </div>

      {/* Placeholder Content */}
      <div className="bg-card mx-auto max-w-4xl rounded-xl border p-12 text-center">
        <Sparkles className="text-primary mx-auto mb-6 h-16 w-16" />
        <h2 className="mb-4 text-3xl font-bold">Full Story Generation</h2>
        <p className="text-muted-foreground mb-8 text-lg">
          This feature will combine all your selected lore pieces into a
          cohesive narrative. The full story generation will be implemented
          soon.
        </p>

        <div className="bg-muted/50 mb-8 rounded-lg p-6">
          <p className="text-muted-foreground text-sm">
            <strong>Theme:</strong> {theme}
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            Your selected character, faction, setting, event, and relic will be
            woven together into an epic adventure story.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <Link href="/">
            <Button variant="outline" size="lg">
              Return Home
            </Button>
          </Link>
          <Link href={`/generate?theme=${theme}`}>
            <Button size="lg" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate New World
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
