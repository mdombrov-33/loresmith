"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
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
  theme,
  characterPiece,
  worldId,
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
      const newVisibility = world.visibility === "private" ? "published" : "private";
      updateVisibilityMutation.mutate({
        worldId: world.id,
        visibility: newVisibility,
      });
    }
  };

  return (
    <>
      <div className="mb-6">
        {/* Large Centered Portrait with Title Overlay */}
        <div className="relative mx-auto w-full max-w-xl">
          {characterImage && (
            <div className="border-primary/30 relative aspect-square w-full overflow-hidden rounded-2xl border-2 shadow-2xl">
              {imageLoading && (
                <div className="bg-muted/30 absolute inset-0 flex items-center justify-center">
                  <Loader2 className="text-muted-foreground h-12 w-12 animate-spin" />
                </div>
              )}
              <Image
                src={characterImage}
                alt={characterPiece?.name || "Character"}
                fill
                className="object-cover"
                onLoad={() => setImageLoading(false)}
              />
              {/* Title Overlay at Bottom */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6">
                <h1 className="text-3xl font-bold text-white md:text-4xl">
                  {parsedStory.quest?.title}
                </h1>
              </div>
            </div>
          )}

          {!characterImage && (
            <h1 className="from-foreground to-foreground/80 mb-4 bg-gradient-to-br bg-clip-text text-center text-3xl font-bold text-transparent md:text-4xl">
              {parsedStory.quest?.title}
            </h1>
          )}
        </div>

        {/* Secondary Actions */}
        {isOwner && (
          <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleVisibility}
                    disabled={updateVisibilityMutation.isPending}
                  >
                    {world?.visibility === "published" ? (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Public
                      </>
                    ) : (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Private
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {world?.visibility === "published" ? "Make Private" : "Publish"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteClick}
              disabled={deleteWorldMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
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
              Are you sure you want to delete &quot;{parsedStory.quest?.title || "this world"}&quot;?
              This action cannot be undone.
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
