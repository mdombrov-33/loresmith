"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface WorldStoryContentProps {
  paragraphs: string[];
}

export default function WorldStoryContent({
  paragraphs,
}: WorldStoryContentProps) {
  return (
    <article className="mb-8">
      <Card className="shadow-xl">
        <CardHeader className="border-border/50 border-b">
          <div className="flex items-center gap-3">
            <figure className="border-primary/30 bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg border">
              <Sparkles className="text-primary h-5 w-5" />
            </figure>
            <CardTitle className="text-2xl">The Chronicle</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4 text-base leading-relaxed">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => (
                <div
                  key={index}
                  className="group relative pl-6 transition-all hover:translate-x-1"
                >
                  <div className="bg-primary/30 group-hover:bg-primary absolute top-2 left-0 h-2 w-2 rounded-full transition-all" />
                  <p className="text-foreground/90 leading-relaxed">
                    {paragraph}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center">
                No story content available.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </article>
  );
}
