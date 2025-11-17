"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Users, MessageSquare, Sparkles } from "lucide-react";
import { FullStory, LorePiece } from "@/lib/schemas";
import RatingDialog from "./RatingDialog";

interface WorldHeroProps {
  parsedStory: FullStory;
  theme: string;
  characterPiece?: LorePiece;
}

export default function WorldHero({
  parsedStory,
  theme,
  characterPiece,
}: WorldHeroProps) {
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);

  // TODO: Replace with real data from backend
  const mockRating = 4.5;
  const mockRatingCount = 12;
  const mockPlayCount = 34;
  const mockCommentCount = 8;

  const characterImage = (characterPiece?.details?.image_portrait || characterPiece?.details?.image) as string | undefined;

  return (
    <>
      <header className="border-border from-card/50 via-card to-card/30 relative mb-8 overflow-hidden rounded-2xl border bg-gradient-to-br shadow-lg backdrop-blur-sm">
        <div className="relative z-10 p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {/* Character Portrait */}
            {characterImage && (
              <div className="shrink-0">
                <div className="border-primary/30 relative h-32 w-32 overflow-hidden rounded-xl border-2 shadow-lg">
                  <Image
                    src={characterImage}
                    alt={characterPiece?.name || "Character"}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* Quest Info */}
            <div className="flex-1 min-w-0">
              <h1 className="from-foreground to-foreground/80 mb-3 bg-gradient-to-br bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                {parsedStory.quest?.title}
              </h1>

              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  {theme.charAt(0).toUpperCase() + theme.slice(1).replace("-", " ")}
                </Badge>

                {/* Rating Display */}
                <button
                  onClick={() => setRatingDialogOpen(true)}
                  className="hover:bg-accent flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors"
                >
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(mockRating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-foreground text-sm font-medium">
                    {mockRating} ({mockRatingCount})
                  </span>
                </button>
              </div>

              {/* Stats */}
              <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>{mockPlayCount} plays</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  <span>{mockCommentCount} comments</span>
                </div>
              </div>
            </div>

            {/* Rate Button */}
            <div className="shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRatingDialogOpen(true)}
                className="gap-2"
              >
                <Star className="h-4 w-4" />
                Rate World
              </Button>
            </div>
          </div>
        </div>
      </header>

      <RatingDialog open={ratingDialogOpen} onOpenChange={setRatingDialogOpen} />
    </>
  );
}
