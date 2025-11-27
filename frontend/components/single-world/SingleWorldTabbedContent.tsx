"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Scroll, MessageSquare, Sparkles } from "lucide-react";
import { FullStory, LorePiece } from "@/lib/schemas";
import WorldLoreAccordion from "./SingleWorldLoreAccordion";
import WorldComments from "./SingleWorldComments";

interface SingleWorldTabbedContentProps {
  parsedStory: FullStory;
  paragraphs: string[];
  lorePieces: LorePiece[];
  displayNames: Record<string, string>;
}

export default function SingleWorldTabbedContent({
  parsedStory,
  paragraphs,
  lorePieces,
  displayNames,
}: SingleWorldTabbedContentProps) {
  return (
    <Tabs defaultValue="quest" className="mb-8">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="quest" className="gap-2">
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Quest</span>
        </TabsTrigger>
        <TabsTrigger value="story" className="gap-2">
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Story</span>
        </TabsTrigger>
        <TabsTrigger value="lore" className="gap-2">
          <Scroll className="h-4 w-4" />
          <span className="hidden sm:inline">Lore</span>
        </TabsTrigger>
        <TabsTrigger value="comments" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Comments</span>
        </TabsTrigger>
      </TabsList>

      {/* Quest Tab */}
      <TabsContent value="quest" className="mt-6">
        <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
          <div className="mb-4 flex items-start gap-3">
            <div className="border-primary/30 bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
              <BookOpen className="text-primary h-5 w-5" />
            </div>
            <div>
              <h2 className="text-foreground text-xl font-semibold">
                Your Quest
              </h2>
              <p className="text-muted-foreground text-sm">
                The objective of your adventure
              </p>
            </div>
          </div>
          <p className="text-foreground leading-relaxed">
            {parsedStory.quest?.description ||
              "No quest description available."}
          </p>
        </div>
      </TabsContent>

      {/* Story Tab */}
      <TabsContent value="story" className="mt-6">
        <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
          <div className="mb-4 flex items-start gap-3">
            <div className="border-primary/30 bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
              <Sparkles className="text-primary h-5 w-5" />
            </div>
            <div>
              <h2 className="text-foreground text-xl font-semibold">
                The Chronicle
              </h2>
              <p className="text-muted-foreground text-sm">
                The full narrative of this world
              </p>
            </div>
          </div>
          <div className="text-foreground space-y-4 leading-relaxed">
            {paragraphs.map((paragraph, idx) => (
              <p key={idx} className="text-base">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </TabsContent>

      {/* Lore Tab */}
      <TabsContent value="lore" className="mt-6">
        <WorldLoreAccordion
          lorePieces={lorePieces}
          displayNames={displayNames}
        />
      </TabsContent>

      {/* Comments Tab */}
      <TabsContent value="comments" className="mt-6">
        <WorldComments />
      </TabsContent>
    </Tabs>
  );
}
