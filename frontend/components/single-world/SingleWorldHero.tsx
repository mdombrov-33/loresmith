"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  Users,
  MessageSquare,
  Sparkles,
  Activity,
  Loader2,
} from "lucide-react";
import { FullStory, LorePiece } from "@/lib/schemas";
import RatingDialog from "./SingleWorldRatingDialog";

interface SingleWorldHeroProps {
  parsedStory: FullStory;
  theme: string;
  characterPiece?: LorePiece;
  activeSessions?: number;
  worldId: number;
  rating?: number;
  userRating?: number;
  ratingCount?: number;
}

export default function SingleWorldHero({
  parsedStory,
  theme,
  characterPiece,
  activeSessions,
  worldId,
  rating,
  userRating,
  ratingCount,
}: SingleWorldHeroProps) {
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // TODO: Replace with real data from backend
  const mockPlayCount = 34;
  const mockCommentCount = 8;

  const characterImage = (characterPiece?.details?.image_portrait ||
    characterPiece?.details?.image) as string | undefined;

  return (
    <>
      <header className="border-border from-card/50 via-card to-card/30 relative mb-8 overflow-hidden rounded-2xl border bg-gradient-to-br shadow-lg backdrop-blur-sm">
        <div className="relative z-10 p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {/* Character Portrait */}
            {characterImage && (
              <div className="shrink-0">
                <div className="border-primary/30 relative h-32 w-32 overflow-hidden rounded-xl border-2 shadow-lg">
                  {imageLoading && (
                    <div className="bg-muted/30 absolute inset-0 flex items-center justify-center">
                      <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                    </div>
                  )}
                  <Image
                    src={characterImage}
                    alt={characterPiece?.name || "Character"}
                    fill
                    className="object-cover"
                    onLoad={() => setImageLoading(false)}
                  />
                </div>
              </div>
            )}

            {/* Quest Info */}
            <div className="min-w-0 flex-1">
              <h1 className="from-foreground to-foreground/80 mb-3 bg-gradient-to-br bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                {parsedStory.quest?.title}
              </h1>

              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  {theme.charAt(0).toUpperCase() +
                    theme.slice(1).replace("-", " ")}
                </Badge>

                {/* Rating Display */}
                {rating !== undefined &&
                rating !== null &&
                ratingCount !== undefined &&
                ratingCount > 0 ? (
                  <div className="flex items-center gap-1.5 px-2 py-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-foreground text-sm font-medium">
                      {rating.toFixed(1)} ({ratingCount})
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2 py-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="text-muted-foreground h-4 w-4"
                        />
                      ))}
                    </div>
                    <span className="text-muted-foreground text-sm">
                      No ratings yet
                    </span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-green-500">
                    {activeSessions ?? 0}{" "}
                    {activeSessions === 1 ? "player" : "players"}
                  </span>
                </div>
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

      <RatingDialog
        open={ratingDialogOpen}
        onOpenChange={setRatingDialogOpen}
        worldId={worldId}
        initialRating={userRating}
      />
    </>
  );
}
