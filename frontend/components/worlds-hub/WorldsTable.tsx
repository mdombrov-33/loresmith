"use client";

import { World } from "@/lib/schemas";
import ActionButton from "@/components/shared/ActionButton";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Play,
  Trash2,
  Users,
  Calendar,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { THEME_OPTIONS } from "@/constants/game-themes";
import {
  useDeleteWorld,
  useUpdateWorldVisibility,
} from "@/lib/queries/world";
import {
  useDeleteAdventureSession,
} from "@/lib/queries/adventure";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAppStore } from "@/stores/appStore";

interface WorldsTableProps {
  worlds: World[];
  isLoading?: boolean;
}

export default function WorldsTable({ worlds, isLoading }: WorldsTableProps) {
  const router = useRouter();
  const deleteWorldMutation = useDeleteWorld();
  const deleteSessionMutation = useDeleteAdventureSession();
  const updateVisibilityMutation = useUpdateWorldVisibility();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [worldToDelete, setWorldToDelete] = useState<{
    id: number;
    type: "world" | "session";
    sessionId?: number;
  } | null>(null);
  const user = useAppStore((state) => state.user);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border-border bg-card/50 h-24 animate-pulse rounded-lg border"
          />
        ))}
      </div>
    );
  }

  if (worlds.length === 0) {
    return (
      <div className="border-border bg-card/30 flex flex-col items-center justify-center rounded-lg border py-16 text-center">
        <Sparkles className="text-muted-foreground mb-4 h-12 w-12" />
        <h3 className="text-foreground mb-2 text-lg font-semibold">
          No worlds yet
        </h3>
        <p className="text-muted-foreground text-sm">
          Create your first world to get started!
        </p>
      </div>
    );
  }

  const handleView = (world: World) => {
    router.push(`/worlds/${world.theme}/${world.id}`);
  };

  const handleResume = (sessionId: number) => {
    router.push(`/adventure/${sessionId}`);
  };

  const handleDelete = (
    worldId: number,
    type: "world" | "session",
    sessionId?: number,
  ) => {
    setWorldToDelete({ id: worldId, type, sessionId });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!worldToDelete) return;

    if (worldToDelete.type === "world") {
      await deleteWorldMutation.mutateAsync(worldToDelete.id);
    } else if (worldToDelete.sessionId) {
      await deleteSessionMutation.mutateAsync(worldToDelete.sessionId);
    }

    setDeleteDialogOpen(false);
    setWorldToDelete(null);
  };

  const handleToggleVisibility = async (
    worldId: number,
    currentVisibility: string,
  ) => {
    const newVisibility =
      currentVisibility === "published" ? "private" : "published";
    await updateVisibilityMutation.mutateAsync({
      worldId,
      visibility: newVisibility as "private" | "published",
    });
  };

  const getThemeLabel = (theme: string) => {
    return THEME_OPTIONS.find((t) => t.value === theme)?.label || theme;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="space-y-3">
        {worlds.map((world) => {
          const fullStory = world.full_story
            ? JSON.parse(world.full_story)
            : null;
          const themeOption = THEME_OPTIONS.find(
            (t) => t.value === world.theme,
          );

          return (
            <div
              key={world.id}
              className="border-border bg-card hover:bg-card/80 group flex items-center gap-4 rounded-lg border p-4 transition-all"
            >
              {/* Icon */}
              <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                {themeOption?.icon ? (
                  <themeOption.icon className="h-6 w-6" />
                ) : (
                  <Sparkles className="h-6 w-6" />
                )}
              </div>

              {/* Content */}
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-foreground truncate font-semibold">
                      {fullStory?.quest?.title || "Untitled World"}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                      <Badge variant="outline" className="text-xs">
                        {getThemeLabel(world.theme)}
                      </Badge>
                      <Badge
                        variant={
                          world.status === "active" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {world.status.charAt(0).toUpperCase() +
                          world.status.slice(1)}
                      </Badge>
                      {world.visibility && world.user_id === user?.id && (
                        <Badge
                          variant="outline"
                          className="hover:bg-accent cursor-pointer gap-1 text-xs transition-colors"
                          onClick={() =>
                            handleToggleVisibility(world.id, world.visibility)
                          }
                        >
                          {world.visibility === "published" ? (
                            <>
                              <Eye className="h-3 w-3" />
                              Published
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" />
                              Private
                            </>
                          )}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="text-muted-foreground flex shrink-0 items-center gap-4 text-xs">
                    {world.active_sessions !== undefined &&
                      world.active_sessions > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{world.active_sessions}</span>
                        </div>
                      )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span suppressHydrationWarning>
                        {formatDate(world.updated_at || world.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {world.status === "active" && world.session_id ? (
                    <>
                      <ActionButton
                        size="sm"
                        variant="default"
                        onClick={() => handleResume(world.session_id!)}
                        icon={<Play className="h-3 w-3" />}
                        className="h-8"
                      >
                        Resume
                      </ActionButton>
                      <ActionButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(world)}
                        icon={<Eye className="h-3 w-3" />}
                        className="h-8"
                      >
                        View
                      </ActionButton>
                      <ActionButton
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleDelete(world.id, "session", world.session_id)
                        }
                        icon={<Trash2 className="h-3 w-3" />}
                        className="text-destructive hover:text-destructive h-8"
                      >
                        Delete Session
                      </ActionButton>
                    </>
                  ) : (
                    <>
                      <ActionButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(world)}
                        icon={<Eye className="h-3 w-3" />}
                        className="h-8"
                      >
                        View
                      </ActionButton>
                      <ActionButton
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(world.id, "world")}
                        icon={<Trash2 className="h-3 w-3" />}
                        className="text-destructive hover:text-destructive h-8"
                      >
                        Delete World
                      </ActionButton>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {worldToDelete?.type === "world"
                ? "This will permanently delete this world. This action cannot be undone."
                : "This will delete your adventure session. The world will remain, but your progress will be lost."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
