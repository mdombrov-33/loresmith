"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { World } from "@/lib/schemas";
import { THEME_OPTIONS } from "@/constants/game-themes";
import { Badge } from "@/components/ui/badge";
import { PrimaryButton } from "@/components/shared/buttons";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, Users, Eye, HelpCircle, Trash2, EyeOff, X as XIcon } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { useDeleteWorld, useUpdateWorldVisibility } from "@/lib/queries/world";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ExpandableWorldCardsProps {
  worlds: World[];
  viewMode?: "grid" | "row";
  showAuthor?: boolean;
}

export default function ExpandableWorldCards({
  worlds,
  viewMode = "grid",
  showAuthor = true,
}: ExpandableWorldCardsProps) {
  const [active, setActive] = useState<World | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAppStore();
  const deleteWorldMutation = useDeleteWorld();
  const updateVisibilityMutation = useUpdateWorldVisibility();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
      }
    }

    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  const handleViewWorld = (world: World) => {
    router.push(`/worlds/${world.theme}/${world.id}`);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (active) {
      deleteWorldMutation.mutate(active.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setActive(null);
        },
      });
    }
  };

  const handleToggleVisibility = () => {
    if (active) {
      const newVisibility = active.visibility === "private" ? "published" : "private";
      updateVisibilityMutation.mutate(
        {
          worldId: active.id,
          visibility: newVisibility,
        },
        {
          onSuccess: () => {
            //* Update active state immediately for UI feedback
            setActive({ ...active, visibility: newVisibility });
          },
        }
      );
    }
  };

  const isOwner = active && user && active.user_id === user.id;

  const getThemeOption = (theme: string) =>
    THEME_OPTIONS.find((t) => t.value === theme);

  const getMatchLabel = (relevance: number) => {
    if (relevance >= 0.7)
      return { label: "High Match", color: "text-green-600" };
    if (relevance >= 0.5)
      return { label: "Medium Match", color: "text-orange-600" };
    return { label: "Low Match", color: "text-red-600" };
  };

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10 h-full w-full bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 z-[100] grid place-items-center">
            <motion.button
              key={`button-${active.id}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white lg:hidden"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`card-${active.id}-${id}`}
              ref={ref}
              className="flex h-full w-full max-w-[500px] flex-col overflow-hidden bg-background dark:bg-neutral-900 md:h-fit md:max-h-[90%] sm:rounded-3xl"
            >
              <motion.div layoutId={`image-${active.id}-${id}`}>
                {active.portrait_url && (
                  <div className="relative h-80 w-full lg:h-80">
                    <Image
                      fill
                      src={active.portrait_url}
                      alt={active.full_story.quest?.title || "World portrait"}
                      className="object-cover object-top sm:rounded-tl-lg sm:rounded-tr-lg"
                    />
                  </div>
                )}
              </motion.div>

              <div>
                <div className="flex items-start justify-between p-4">
                  <div className="flex-1">
                    <motion.h3
                      layoutId={`title-${active.id}-${id}`}
                      className="text-base font-bold text-foreground"
                    >
                      {active.full_story.quest?.title || "Untitled World"}
                    </motion.h3>
                    {showAuthor && (
                      <motion.p
                        layoutId={`description-${active.id}-${id}`}
                        className="text-sm text-muted-foreground"
                      >
                        by {active.user_name || "Unknown"}
                      </motion.p>
                    )}

                    {/* Badges */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">
                        {getThemeOption(active.theme)?.label || active.theme}
                      </Badge>
                      {/* Social metadata */}
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="font-medium">0.0</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />
                        <span>0</span>
                      </div>
                      {active.active_sessions !== undefined &&
                        active.active_sessions > 0 && (
                          <div className="flex items-center gap-1 text-xs text-green-400">
                            <Users className="h-3 w-3" />
                            <span>{active.active_sessions}</span>
                          </div>
                        )}
                    </div>
                  </div>

                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-2"
                  >
                    {isOwner && (
                      <>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleToggleVisibility}
                                disabled={updateVisibilityMutation.isPending}
                              >
                                {active.visibility === "published" ? (
                                  <Eye className="h-4 w-4" />
                                ) : (
                                  <EyeOff className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {active.visibility === "published" ? "Make Private" : "Publish"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDeleteClick}
                          disabled={deleteWorldMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <PrimaryButton
                      onClick={() => handleViewWorld(active)}
                      className="text-sm"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </PrimaryButton>
                  </motion.div>
                </div>
                <div className="relative px-4 pt-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="max-h-60 overflow-y-auto pb-10 text-sm text-muted-foreground md:max-h-80"
                  >
                    <p className="line-clamp-[20]">
                      {active.full_story.content || "No description available"}
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {/* Cards Grid/Row */}
      <ul
        className={
          viewMode === "grid"
            ? "mx-auto grid w-full grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3"
            : "mx-auto w-full gap-4"
        }
      >
        {worlds.map((world) => {
          const themeOption = getThemeOption(world.theme);

          if (viewMode === "row") {
            return (
              <motion.div
                layoutId={`card-${world.id}-${id}`}
                key={`card-${world.id}-${id}`}
                onClick={() => setActive(world)}
                className="flex cursor-pointer flex-col items-center justify-between rounded-xl p-4 hover:bg-accent md:flex-row"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <motion.div layoutId={`image-${world.id}-${id}`}>
                    {world.portrait_url && (
                      <div className="relative h-20 w-20 flex-shrink-0">
                        <Image
                          fill
                          src={world.portrait_url}
                          alt={world.full_story.quest?.title || "World portrait"}
                          className="rounded-lg object-cover object-top"
                          sizes="80px"
                        />
                      </div>
                    )}
                  </motion.div>
                  <div className="flex flex-col gap-2">
                    <motion.h3
                      layoutId={`title-${world.id}-${id}`}
                      className="text-center font-medium text-foreground md:text-left"
                    >
                      {world.full_story.quest?.title || "Untitled World"}
                    </motion.h3>
                    {showAuthor && (
                      <motion.p
                        layoutId={`description-${world.id}-${id}`}
                        className="text-center text-sm text-muted-foreground md:text-left"
                      >
                        by {world.user_name || "Unknown"}
                      </motion.p>
                    )}
                    {/* Social metadata preview */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="font-medium">0.0</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />
                        <span>0</span>
                      </div>
                      {world.active_sessions !== undefined &&
                        world.active_sessions > 0 && (
                          <div className="flex items-center gap-1 text-green-400">
                            <Users className="h-3 w-3" />
                            <span>{world.active_sessions}</span>
                          </div>
                        )}
                    </div>

                    {/* Relevance Match Indicator */}
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
                              <HelpCircle className="h-3 w-3 cursor-help text-muted-foreground" />
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
                </div>
                <motion.button
                  layoutId={`button-${world.id}-${id}`}
                  className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 md:mt-0"
                >
                  View
                </motion.button>
              </motion.div>
            );
          }

          // Grid view
          return (
            <motion.div
              layoutId={`card-${world.id}-${id}`}
              key={world.id}
              onClick={() => setActive(world)}
              className="flex cursor-pointer flex-col rounded-xl p-4 hover:bg-accent"
            >
              <div className="flex w-full flex-col gap-4">
                <motion.div layoutId={`image-${world.id}-${id}`}>
                  {world.portrait_url && (
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        fill
                        src={world.portrait_url}
                        alt={world.full_story.quest?.title || "World portrait"}
                        className="rounded-lg object-cover object-top"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                </motion.div>
                <div className="flex flex-col items-center justify-center gap-2">
                  <motion.h3
                    layoutId={`title-${world.id}-${id}`}
                    className="text-center text-base font-medium text-foreground md:text-left"
                  >
                    {world.full_story.quest?.title || "Untitled World"}
                  </motion.h3>
                  {showAuthor && (
                    <motion.p
                      layoutId={`description-${world.id}-${id}`}
                      className="text-center text-sm text-muted-foreground md:text-left"
                    >
                      by {world.user_name || "Unknown"}
                    </motion.p>
                  )}

                  {/* Theme badge */}
                  <Badge variant="outline" className="mt-1">
                    {themeOption?.label || world.theme}
                  </Badge>

                  {/* Social metadata preview */}
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="font-medium">0.0</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      <span>0</span>
                    </div>
                    {world.active_sessions !== undefined &&
                      world.active_sessions > 0 && (
                        <div className="flex items-center gap-1 text-green-400">
                          <Users className="h-3 w-3" />
                          <span>{world.active_sessions}</span>
                        </div>
                      )}
                  </div>

                  {/* Relevance Match Indicator */}
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
                            <HelpCircle className="h-3 w-3 cursor-help text-muted-foreground" />
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
              </div>
            </motion.div>
          );
        })}
      </ul>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogPortal>
          <DialogOverlay className="z-[150]" />
          <DialogPrimitive.Content className="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-[200] grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Delete World</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{active?.full_story.quest?.title || "this world"}&quot;?
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
            <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};
