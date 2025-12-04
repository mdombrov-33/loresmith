"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Eye, EyeOff } from "lucide-react";
import { FullStory, LorePiece, World } from "@/lib/schemas";
import { useAppStore } from "@/stores/appStore";
import { useDeleteWorld, useUpdateWorldVisibility } from "@/lib/queries/world";
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

interface SingleWorldHeroProps {
  parsedStory: FullStory;
  theme: string;
  characterPiece?: LorePiece;
  worldId: number;
  world?: World;
}

export default function SingleWorldHero({
  parsedStory,
  characterPiece,
  world,
}: SingleWorldHeroProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const router = useRouter();
  const { user } = useAppStore();
  const deleteWorldMutation = useDeleteWorld();
  const updateVisibilityMutation = useUpdateWorldVisibility();

  const isOwner = world && user && world.user_id === user.id;

  const characterImage = (characterPiece?.details?.image_portrait ||
    characterPiece?.details?.image) as string | undefined;

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (world) {
      deleteWorldMutation.mutate(world.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          router.push("/my-worlds");
        },
      });
    }
  };

  const handleToggleVisibility = () => {
    if (world) {
      const newVisibility =
        world.visibility === "private" ? "published" : "private";
      updateVisibilityMutation.mutate({
        worldId: world.id,
        visibility: newVisibility,
      });
    }
  };

  return (
    <>
      <div className="mb-10">
        {/* Cinematic Hero - Letterbox Style */}
        <div className="relative mx-auto w-full max-w-6xl">
          {characterImage && (
            <div className="hero-animate border-primary/20 relative aspect-[21/9] overflow-hidden rounded-xl border-2 shadow-2xl">
              {imageLoading && (
                <div className="bg-muted/30 absolute inset-0 flex items-center justify-center">
                  <Loader2 className="text-muted-foreground h-12 w-12 animate-spin" />
                </div>
              )}

              {/* Background gradient */}
              <div className="from-background via-background/95 to-muted/90 absolute inset-0 bg-gradient-to-r" />

              {/* Portrait on left side */}
              <div className="absolute top-0 bottom-0 left-0 w-1/2">
                <Image
                  src={characterImage}
                  alt={characterPiece?.name || "Character"}
                  fill
                  className="object-cover object-center"
                  priority
                  onLoad={() => setImageLoading(false)}
                />
                <div className="to-background absolute inset-0 bg-gradient-to-r from-transparent" />
              </div>

              {/* Cinematic vignette */}
              <div className="cinematic-vignette" />

              {/* Title on right side */}
              <div className="absolute inset-y-0 right-0 flex w-1/2 items-center px-8 md:px-12">
                <h1 className="font-heading text-foreground text-3xl font-bold md:text-4xl lg:text-5xl">
                  {parsedStory.quest?.title}
                </h1>
              </div>
            </div>
          )}

          {!characterImage && (
            <div className="hero-animate mx-auto max-w-4xl py-8">
              <h1 className="from-foreground to-foreground/70 font-heading bg-gradient-to-br bg-clip-text text-center text-3xl font-bold text-transparent md:text-4xl lg:text-5xl">
                {parsedStory.quest?.title}
              </h1>
            </div>
          )}
        </div>

        {/* Owner actions */}
        {isOwner && (
          <div className="mx-auto mt-6 flex max-w-6xl flex-wrap items-center justify-start gap-3 px-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleVisibility}
                    disabled={updateVisibilityMutation.isPending}
                    className="gap-2"
                  >
                    {world?.visibility === "published" ? (
                      <>
                        <Eye className="h-4 w-4" />
                        Public
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Private
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {world?.visibility === "published"
                    ? "Make Private"
                    : "Publish"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteClick}
              disabled={deleteWorldMutation.isPending}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete World</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;
              {parsedStory.quest?.title || "this world"}&quot;? This action
              cannot be undone.
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
    </>
  );
}
