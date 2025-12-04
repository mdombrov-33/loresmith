"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { PrimaryButton } from "@/components/shared/buttons";
import ActionButton from "@/components/shared/buttons/ActionButton";
import {
  Star,
  Users,
  MessageSquare,
  Sparkles,
  Activity,
  Calendar,
  Clock,
  Compass,
  Play,
} from "lucide-react";
import { World } from "@/lib/schemas";
import RatingDialog from "./SingleWorldRatingDialog";
import {
  useStartAdventure,
  useCheckActiveSession,
} from "@/lib/queries/adventure";
import { ActionLoading } from "@/components/shared/LoadingStates";

interface SingleWorldMetadataProps {
  world?: World;
  theme: string;
  activeSessions?: number;
  rating?: number;
  userRating?: number;
  ratingCount?: number;
  worldId: number;
}

export default function SingleWorldMetadata({
  world,
  theme,
  activeSessions,
  rating,
  userRating,
  ratingCount,
  worldId,
}: SingleWorldMetadataProps) {
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const router = useRouter();
  const startAdventureMutation = useStartAdventure();
  const { data: sessionCheck, isLoading: isCheckingSession } =
    useCheckActiveSession(worldId);

  const handleBeginAdventure = async () => {
    try {
      if (sessionCheck?.has_active_session && sessionCheck?.session) {
        router.push(`/adventure/${sessionCheck.session.id}`);
      } else {
        const result = await startAdventureMutation.mutateAsync(worldId);
        router.push(`/adventure/${result.session_id}`);
      }
    } catch (error) {
      console.error("Failed to start adventure:", error);
    }
  };

  const hasActiveSession = sessionCheck?.has_active_session ?? false;

  // TODO: Replace with real data from backend
  const mockPlayCount = 34;
  const mockCommentCount = 8;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <>
      {startAdventureMutation.isPending && (
        <ActionLoading
          title={
            hasActiveSession ? "Resuming Adventure" : "Initializing Adventure"
          }
          description={
            hasActiveSession
              ? "Loading your journey..."
              : "Preparing your journey..."
          }
        />
      )}

      <div className="space-y-4">
        {/* Primary CTA - Begin Adventure */}
        <PrimaryButton
          onClick={handleBeginAdventure}
          disabled={startAdventureMutation.isPending || isCheckingSession}
          className="group hover:shadow-primary/25 h-14 w-full gap-3 px-8 text-lg shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
        >
          {hasActiveSession ? (
            <>
              <Play className="h-5 w-5 transition-transform group-hover:scale-110" />
              Continue
            </>
          ) : (
            <>
              <Compass className="h-5 w-5 transition-transform group-hover:rotate-12" />
              Begin Adventure
            </>
          )}
        </PrimaryButton>

        {/* Metadata Sidebar */}
        <div className="border-border bg-card sticky top-4 rounded-xl border p-6 shadow-sm">
          <h3 className="font-heading text-foreground mb-4 text-lg font-semibold">
            Details
          </h3>

          <div className="space-y-4">
            {/* Author */}
            <div>
              <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs">
                <Users className="h-3.5 w-3.5" />
                <span>Author</span>
              </div>
              <div className="text-foreground text-sm font-medium">
                {world?.user_name || "Unknown"}
              </div>
            </div>

            {/* Theme */}
            <div>
              <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Theme</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {theme.charAt(0).toUpperCase() +
                  theme.slice(1).replace("-", " ")}
              </Badge>
            </div>

            {/* Rating */}
            <div>
              <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs">
                <Star className="h-3.5 w-3.5" />
                <span>Rating</span>
              </div>
              {rating !== undefined &&
              rating !== null &&
              ratingCount !== undefined &&
              ratingCount > 0 ? (
                <div className="flex items-center gap-2">
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
                <div className="text-muted-foreground text-sm">
                  Not rated yet
                </div>
              )}
            </div>

            {/* Active Sessions */}
            <div>
              <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs">
                <Activity className="h-3.5 w-3.5" />
                <span>Active Players</span>
              </div>
              <div className="text-foreground text-sm font-medium">
                {activeSessions ?? 0}{" "}
                {activeSessions === 1 ? "player" : "players"}
              </div>
            </div>

            {/* Plays */}
            <div>
              <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs">
                <Users className="h-3.5 w-3.5" />
                <span>Total Plays</span>
              </div>
              <div className="text-foreground text-sm font-medium">
                {mockPlayCount}
              </div>
            </div>

            {/* Comments */}
            <div>
              <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Comments</span>
              </div>
              <div className="text-foreground text-sm font-medium">
                {mockCommentCount}
              </div>
            </div>

            {/* Created */}
            <div>
              <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs">
                <Calendar className="h-3.5 w-3.5" />
                <span>Created</span>
              </div>
              <div className="text-foreground text-sm font-medium">
                {formatDate(world?.created_at)}
              </div>
            </div>

            {/* Updated */}
            <div>
              <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs">
                <Clock className="h-3.5 w-3.5" />
                <span>Updated</span>
              </div>
              <div className="text-foreground text-sm font-medium">
                {formatDate(world?.updated_at)}
              </div>
            </div>

            {/* Rate Button */}
            <div className="border-border mt-4 border-t pt-4">
              <ActionButton
                onClick={() => setRatingDialogOpen(true)}
                className="w-full gap-2"
              >
                <Star className="h-4 w-4" />
                Rate World
              </ActionButton>
            </div>
          </div>
        </div>

        <RatingDialog
          open={ratingDialogOpen}
          onOpenChange={setRatingDialogOpen}
          worldId={world?.id || 0}
          initialRating={userRating}
        />
      </div>
    </>
  );
}
