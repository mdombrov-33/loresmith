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
          <themeOption.icon className="text-muted-foreground h-6 w-6" />
        </div>
      )}
      <CardHeader className="pt-6">
        <CardTitle className="line-clamp-2 text-lg">
          {fullStory.quest?.title || "Untitled World"}
        </CardTitle>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="secondary">
            {world.status.charAt(0).toUpperCase() + world.status.slice(1)}
          </Badge>
          <Badge variant="outline">{themeOption?.label || world.theme}</Badge>
          {world.user_name && (
            <Badge variant="outline" className="text-xs">
              by {world.user_name}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
          {fullStory.content || "No description available"}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">
            {new Date(world.created_at).toLocaleDateString()}
          </span>
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
