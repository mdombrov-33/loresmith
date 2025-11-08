"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ActionButton from "@/components/shared/ActionButton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Eye, EyeOff } from "lucide-react";
import { THEME_OPTIONS } from "@/constants/game-themes";
import { World } from "@/lib/schemas";
import {
  useDeleteWorld,
  useUpdateWorldVisibility,
} from "@/lib/queries/world";
import {
  useDeleteAdventureSession,
} from "@/lib/queries/adventure";

interface SearchResultCardProps {
  world: World;
  scope: "my" | "global";
}

export default function SearchResultCard({
  world,
  scope,
}: SearchResultCardProps) {
  const router = useRouter();
  const deleteWorldMutation = useDeleteWorld();
  const deleteSessionMutation = useDeleteAdventureSession();
  const updateVisibilityMutation = useUpdateWorldVisibility();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"world" | "session">("world");

  const fullStory = JSON.parse(world.full_story);
  const themeOption = THEME_OPTIONS.find((t) => t.value === world.theme);
  const themeBorderColor = themeOption
    ? `border-${themeOption.value}`
    : "border-primary";

  const getMatchLabel = (relevance: number) => {
    if (relevance >= 0.7)
      return { label: "High Match", color: "text-green-600" };
    if (relevance >= 0.5)
      return { label: "Medium Match", color: "text-orange-600" };
    return { label: "Low Match", color: "text-red-600" };
  };

  const handleViewWorld = () => {
    router.push(`/worlds/${world.theme}/${world.id}`);
  };

  const handleResumeAdventure = () => {
    if (world.session_id) {
      router.push(`/adventure/${world.session_id}`);
    }
  };

  const handleDeleteWorldClick = () => {
    setDeleteType("world");
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSessionClick = () => {
    setDeleteType("session");
    setIsDeleteDialogOpen(true);
  };

  const handleToggleVisibility = () => {
    const newVisibility =
      world.visibility === "private" ? "published" : "private";
    updateVisibilityMutation.mutate({
      worldId: world.id,
      visibility: newVisibility,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteType === "world") {
      deleteWorldMutation.mutate(world.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
        },
        onError: () => {
          setIsDeleteDialogOpen(false);
        },
      });
    } else if (deleteType === "session" && world.session_id) {
      deleteSessionMutation.mutate(world.session_id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
        },
        onError: () => {
          setIsDeleteDialogOpen(false);
        },
      });
    }
  };

  return (
    <Card
      className={`group relative border-2 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl ${themeBorderColor}`}
    >
      {themeOption && (
        <div className="absolute top-3 right-3 transition-all duration-300 group-hover:scale-110">
          <themeOption.icon className="text-muted-foreground group-hover:text-primary h-8 w-8 transition-colors duration-300" />
        </div>
      )}
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{themeOption?.label || world.theme}</Badge>
          <Badge variant="secondary">
            {world.status.charAt(0).toUpperCase() + world.status.slice(1)}
          </Badge>
          {world.status === "active" && world.active_sessions !== undefined && (
            <Badge variant="default" className="bg-green-600">
              {world.active_sessions}{" "}
              {world.active_sessions === 1 ? "player" : "players"}
            </Badge>
          )}
        </div>
        <CardTitle className="line-clamp-2 text-lg transition-colors duration-200 group-hover:text-primary">
          {fullStory.quest?.title || "Untitled World"}
        </CardTitle>
        {world.user_name && (
          <Badge variant="outline" className="mt-2 w-fit text-xs">
            by {world.user_name}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
          {fullStory.content || "No description available"}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">
              {new Date(world.created_at).toLocaleDateString()}
            </span>
            {world.relevance && (
              <div className="mt-2 flex items-center gap-1">
                <span
                  className={`text-xs font-medium ${getMatchLabel(world.relevance).color}`}
                >
                  {getMatchLabel(world.relevance).label}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="text-muted-foreground h-3 w-3 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Results ranked by AI for relevance and variety. Score
                        reflects how well it matches your search.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {scope === "my" ? (
              <>
                {world.status === "draft" ? (
                  <>
                    <ActionButton
                      size="sm"
                      variant="destructive"
                      onClick={handleDeleteWorldClick}
                      disabled={deleteWorldMutation.isPending}
                    >
                      {deleteWorldMutation.isPending ? "Deleting..." : "Delete"}
                    </ActionButton>
                    <ActionButton size="sm" onClick={handleViewWorld}>
                      View
                    </ActionButton>
                  </>
                ) : world.status === "active" && world.session_id ? (
                  <>
                    <ActionButton
                      size="sm"
                      variant="destructive"
                      onClick={handleDeleteSessionClick}
                      disabled={deleteSessionMutation.isPending}
                    >
                      {deleteSessionMutation.isPending
                        ? "Deleting..."
                        : "Delete"}
                    </ActionButton>
                    <ActionButton size="sm" onClick={handleResumeAdventure}>
                      Resume
                    </ActionButton>
                  </>
                ) : world.status === "completed" && world.session_id ? (
                  <>
                    <ActionButton
                      size="sm"
                      variant="destructive"
                      onClick={handleDeleteSessionClick}
                      disabled={deleteSessionMutation.isPending}
                    >
                      {deleteSessionMutation.isPending
                        ? "Deleting..."
                        : "Delete"}
                    </ActionButton>
                    <ActionButton size="sm" onClick={handleViewWorld}>
                      View
                    </ActionButton>
                  </>
                ) : (
                  <ActionButton size="sm" onClick={handleViewWorld}>
                    View
                  </ActionButton>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ActionButton
                        variant="outline"
                        size="sm"
                        onClick={handleToggleVisibility}
                        disabled={updateVisibilityMutation.isPending}
                        icon={
                          updateVisibilityMutation.isPending ? (
                            <span className="h-4 w-4">...</span>
                          ) : world.visibility === "published" ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )
                        }
                        className="hover:bg-primary hover:text-primary-foreground px-2 transition-colors"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {world.visibility === "published"
                          ? "Published - Click to make private."
                          : "Private - Click to publish."}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : (
              <>
                {world.status === "active" && world.session_id ? (
                  <ActionButton size="sm" onClick={handleResumeAdventure}>
                    Resume
                  </ActionButton>
                ) : (
                  <ActionButton size="sm" onClick={handleViewWorld}>
                    View
                  </ActionButton>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteType === "world"
                ? "Delete World"
                : "Delete Adventure Session"}
            </DialogTitle>
            <DialogDescription>
              {deleteType === "world" ? (
                <>
                  Are you sure you want to delete &quot;
                  {fullStory.quest?.title || "this world"}&quot;? This action
                  cannot be undone.
                </>
              ) : (
                <>
                  Are you sure you want to delete the adventure session for
                  &quot;{fullStory.quest?.title || "this world"}&quot;? Your
                  progress will be lost and the world will return to draft
                  status.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <ActionButton
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={
                deleteWorldMutation.isPending || deleteSessionMutation.isPending
              }
            >
              Cancel
            </ActionButton>
            <ActionButton
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={
                deleteWorldMutation.isPending || deleteSessionMutation.isPending
              }
            >
              {deleteWorldMutation.isPending || deleteSessionMutation.isPending
                ? "Deleting..."
                : "Delete"}
            </ActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
