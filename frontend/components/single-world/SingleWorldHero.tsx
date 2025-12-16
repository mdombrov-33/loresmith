"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import { FullStory, LorePiece, World } from "@/lib/schemas";
import { useAppStore } from "@/stores/appStore";
import {
  useDeleteWorld,
  useUpdateWorldVisibility,
  useUpdateActiveImageType,
} from "@/lib/queries/world";
import {
  useCheckActiveSession,
  useDeleteAdventureSession,
} from "@/lib/queries/adventure";
import { useGenerateWorldImage } from "@/lib/queries/worldImage";
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
  worldId,
}: SingleWorldHeroProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isTogglingImage, setIsTogglingImage] = useState(false);
  const [optimisticImageType, setOptimisticImageType] = useState<string | null>(
    null,
  );
  const [optimisticImageUrl, setOptimisticImageUrl] = useState<string | null>(
    null,
  );
  const router = useRouter();
  const { user } = useAppStore();
  const deleteWorldMutation = useDeleteWorld();
  const deleteSessionMutation = useDeleteAdventureSession();
  const updateVisibilityMutation = useUpdateWorldVisibility();
  const updateActiveImageTypeMutation = useUpdateActiveImageType();
  const { data: sessionCheck } = useCheckActiveSession(worldId);

  const { generate: generateWorldImage, isGenerating } = useGenerateWorldImage(
    (result: unknown) => {
      const data = result as { image_url?: string };
      const imageUrl = data?.image_url;
      if (imageUrl) {
        setOptimisticImageUrl(imageUrl);
        setOptimisticImageType("world_scene");
      }
    },
    (error) => {
      console.error("World image generation failed:", error);
    },
  );

  const isOwner = world && user && world.user_id === user.id;
  const hasSession = sessionCheck?.has_active_session ?? false;

  const characterImage = (characterPiece?.details?.image_portrait ||
    characterPiece?.details?.image) as string | undefined;

  //* Use optimistic state if available, otherwise use database value
  const currentImageType = optimisticImageType ?? world?.active_image_type;
  const currentWorldImageUrl = optimisticImageUrl ?? world?.image_url;

  //* Determine which image to display
  const displayImage =
    currentImageType === "world_scene" && currentWorldImageUrl
      ? currentWorldImageUrl
      : characterImage;

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    //* If user has an active session, delete the session instead of the world
    if (hasSession && sessionCheck?.session?.id) {
      deleteSessionMutation.mutate(sessionCheck.session.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          router.refresh();
        },
      });
    } else if (world) {
      //* No active session, delete the world
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

  const handleGenerateWorldImage = () => {
    if (world) {
      generateWorldImage(world.id);
    }
  };

  const handleToggleImage = (checked: boolean) => {
    if (!world) return;

    const activeImageType = checked ? "world_scene" : "portrait";

    //* Optimistically update UI immediately
    setOptimisticImageType(activeImageType);
    setIsTogglingImage(true);
    setImageLoading(true);

    updateActiveImageTypeMutation.mutate(
      { worldId: world.id, activeImageType },
      {
        onSuccess: () => {
          //* Success - optimistic state is correct
          setIsTogglingImage(false);
        },
        onError: (error) => {
          console.error("Failed to toggle image:", error);
          //* Rollback optimistic update on failure
          setOptimisticImageType(world.active_image_type);
          setIsTogglingImage(false);
        },
      },
    );
  };

  return (
    <>
      <div className="mb-10">
        {/* Cinematic Hero - Letterbox Style */}
        <div className="relative mx-auto w-full max-w-6xl">
          {displayImage && (
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
                  key={displayImage}
                  src={displayImage}
                  alt={
                    currentImageType === "world_scene"
                      ? parsedStory.quest?.title || "World Scene"
                      : characterPiece?.name || "Character"
                  }
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

          {!displayImage && (
            <div className="hero-animate mx-auto max-w-4xl py-8">
              <h1 className="from-foreground to-foreground/70 font-heading bg-gradient-to-br bg-clip-text text-center text-3xl font-bold text-transparent md:text-4xl lg:text-5xl">
                {parsedStory.quest?.title}
              </h1>
            </div>
          )}
        </div>

        {/* Owner/Session actions */}
        {(isOwner || hasSession) && (
          <div className="mx-auto mt-6 flex max-w-6xl flex-wrap items-center justify-start gap-3 px-2">
            {/* Image toggle - show only if world scene exists */}
            {isOwner && currentWorldImageUrl && (
              <div className="border-border bg-background flex items-center gap-2 rounded-md border px-3 py-2">
                <ImageIcon className="text-muted-foreground h-4 w-4" />
                <Label
                  htmlFor="image-toggle"
                  className="cursor-pointer text-sm"
                >
                  {currentImageType === "world_scene"
                    ? "World Scene"
                    : "Character Portrait"}
                </Label>
                <Switch
                  id="image-toggle"
                  checked={currentImageType === "world_scene"}
                  onCheckedChange={handleToggleImage}
                  disabled={isTogglingImage}
                />
              </div>
            )}

            {/* Visibility toggle - only for owners */}
            {isOwner && (
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
            )}

            {/* Generate World Image button - only for owners */}
            {isOwner && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateWorldImage}
                      disabled={isGenerating}
                      className="gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Generate Image
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Generate a world scene image based on your story
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Delete button - for owners (delete world) or sessions (end adventure) */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteClick}
              disabled={
                deleteWorldMutation.isPending || deleteSessionMutation.isPending
              }
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {hasSession ? "End Adventure" : "Delete World"}
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {hasSession ? "End Adventure" : "Delete World"}
            </DialogTitle>
            <DialogDescription>
              {hasSession ? (
                <>
                  Are you sure you want to end your adventure session in &quot;
                  {parsedStory.quest?.title || "this world"}&quot;?
                </>
              ) : (
                <>
                  Are you sure you want to delete &quot;
                  {parsedStory.quest?.title || "this world"}&quot;? This action
                  cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={
                deleteWorldMutation.isPending || deleteSessionMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={
                deleteWorldMutation.isPending || deleteSessionMutation.isPending
              }
            >
              {deleteWorldMutation.isPending || deleteSessionMutation.isPending
                ? "Deleting..."
                : hasSession
                  ? "End Adventure"
                  : "Delete World"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
