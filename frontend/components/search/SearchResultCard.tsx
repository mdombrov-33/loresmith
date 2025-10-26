"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ActionButton from "@/components/shared/ActionButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { HelpCircle } from "lucide-react";
import { THEME_OPTIONS } from "@/constants/game-themes";
import { World } from "@/types/api";
import { useDeleteWorld } from "@/lib/queries";

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const fullStory = JSON.parse(world.full_story);
  const themeOption = THEME_OPTIONS.find((t) => t.value === world.theme);
  const themeBorderColor = themeOption
    ? `border-${themeOption.value}`
    : "border-primary";

  const getMatchLabel = (relevance: number) => {
    if (relevance >= 0.8)
      return { label: "High Match", color: "text-green-600" };
    if (relevance >= 0.5)
      return { label: "Medium Match", color: "text-orange-600" };
    return { label: "Low Match", color: "text-red-600" };
  };

  const handleViewWorld = () => {
    router.push(`/worlds/${world.theme}/${world.id}`);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteWorldMutation.mutate(world.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
      },
      onError: () => {
        setIsDeleteDialogOpen(false);
      },
    });
  };

  return (
    <Card
      className={`relative border-2 transition-all hover:scale-[1.02] hover:shadow-lg ${themeBorderColor}`}
    >
      {themeOption && (
        <div className="absolute top-3 right-3">
          <themeOption.icon className="text-muted-foreground h-8 w-8" />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{themeOption?.label || world.theme}</Badge>
          <Badge variant="secondary">
            {world.status.charAt(0).toUpperCase() + world.status.slice(1)}
          </Badge>
        </div>
        <CardTitle className="line-clamp-2 text-lg">
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
                        Results ranked by AI for thematic relevance. Score
                        reflects semantic match.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {scope === "my" && (
              <ActionButton
                size="sm"
                variant="destructive"
                onClick={handleDeleteClick}
                disabled={deleteWorldMutation.isPending}
              >
                {deleteWorldMutation.isPending ? "Deleting..." : "Delete"}
              </ActionButton>
            )}
            <ActionButton size="sm" onClick={handleViewWorld}>
              View World
            </ActionButton>
          </div>
        </div>
      </CardContent>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete World</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;
              {fullStory.quest?.title || "this world"}&quot;? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteWorldMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteWorldMutation.isPending}
            >
              {deleteWorldMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
