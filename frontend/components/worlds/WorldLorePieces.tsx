"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Scroll,
  Eye,
  ChevronRight,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import { LorePiece } from "@/types/api";
import { loreIcons, getAttributeIcon } from "@/constants/lore";
import {
  getTraitIcon,
  getTraitColor,
  getTraitDescription,
} from "@/lib/trait-icons";

interface WorldLorePiecesProps {
  lorePieces: LorePiece[];
  displayNames: Record<string, string>;
  sortDetails: (details: Record<string, unknown>) => [string, unknown][];
}

export default function WorldLorePieces({
  lorePieces,
  displayNames,
  sortDetails,
}: WorldLorePiecesProps) {
  return (
    <section className="mb-8">
      <Card className="shadow-xl">
        <CardHeader className="border-border/50 border-b">
          <div className="flex items-center gap-3">
            <figure className="border-primary/30 bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg border">
              <Scroll className="text-primary h-5 w-5" />
            </figure>
            <CardTitle className="text-2xl">World Encyclopedia</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {lorePieces?.map((piece) => (
              <LorePieceCard
                key={piece.id}
                piece={piece}
                displayNames={displayNames}
                sortDetails={sortDetails}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

interface LorePieceCardProps {
  piece: LorePiece;
  displayNames: Record<string, string>;
  sortDetails: (details: Record<string, unknown>) => [string, unknown][];
}

function LorePieceCard({
  piece,
  displayNames,
  sortDetails,
}: LorePieceCardProps) {
  const Icon = loreIcons[piece.type] || Scroll;

  return (
    <article className="group border-border/50 hover:border-primary/50 relative overflow-hidden border-2 transition-all hover:shadow-lg">
      {/* Hover gradient effect */}
      <div className="from-primary/5 to-secondary/5 absolute inset-0 bg-gradient-to-br via-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <CardHeader className="relative pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <figure className="border-primary/30 bg-primary/10 group-hover:bg-primary/20 flex h-10 w-10 items-center justify-center rounded-lg border transition-all group-hover:scale-110">
              <Icon className="text-primary h-5 w-5" />
            </figure>
            <div>
              <Badge variant="outline" className="mt-3 mb-2">
                {displayNames[piece.type] || piece.type}
              </Badge>
              <h3 className="text-lg font-bold">{piece.name}</h3>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4 px-6 pb-6">
        <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
          {piece.description}
        </p>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="group/btn w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Read More
              </span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="border-primary/30 bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg border">
                  <Icon className="text-primary h-5 w-5" />
                </div>
                <div>
                  <Badge variant="outline" className="mb-1">
                    {displayNames[piece.type] || piece.type}
                  </Badge>
                  <div>{piece.name}</div>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              {/* Character Image */}
              {piece.type === "character" &&
               piece.details.image_card &&
               piece.details.image_card !== "None" &&
               piece.details.image_card.startsWith("/") && (
                <div className="relative h-64 w-full overflow-hidden rounded-lg">
                  <Image
                    src={piece.details.image_card}
                    alt={piece.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 672px"
                  />
                </div>
              )}

              <div>
                <h4 className="mb-3 flex items-center gap-2 font-semibold">
                  <BookOpen className="text-primary h-4 w-4" />
                  Description
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {piece.description}
                </p>
              </div>
              {piece.details && Object.keys(piece.details).length > 0 && (
                <div>
                  <h4 className="mb-4 flex items-center gap-2 font-semibold">
                    <Scroll className="text-primary h-4 w-4" />
                    Details
                  </h4>
                  <div className="grid gap-3">
                    {sortDetails(piece.details).map(([key, value]) => {
                      if (key === "is_protagonist") return null;

                      const isFlaw = key === "flaw";
                      const { icon: AttributeIcon, color } = isFlaw
                        ? { icon: AlertTriangle, color: "text-red-500" }
                        : getAttributeIcon(key);

                      //* Special handling for traits array
                      if (key === "traits") {
                        let traitsArray = value;
                        if (typeof value === "string") {
                          try {
                            traitsArray = JSON.parse(value);
                          } catch (e) {
                            traitsArray = [];
                            console.error("Failed to parse traits JSON:", e);
                          }
                        }
                        if (Array.isArray(traitsArray)) {
                          return (
                            <div
                              key={key}
                              className="border-border/50 bg-muted/30 hover:border-primary/30 hover:bg-muted/50 flex flex-col gap-2 rounded-lg border p-4 transition-all"
                            >
                              <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                                <AttributeIcon className={`h-3 w-3 ${color}`} />
                                Personality Traits
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {traitsArray.map((trait: string, index: number) => {
                                  const TraitIcon = getTraitIcon(trait);
                                  const colorClass = getTraitColor(trait);
                                  const description = getTraitDescription(trait);
                                  return (
                                    <TooltipProvider key={index}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="bg-muted/50 border-border flex cursor-help items-center gap-1.5 rounded-lg border px-3 py-1.5">
                                            <TraitIcon
                                              className={`h-4 w-4 ${colorClass}`}
                                            />
                                            <span className="text-foreground text-sm font-medium">
                                              {trait}
                                            </span>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="max-w-xs">{description}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }
                      }

                      //* Special handling for skills array (parse JSON string if needed)
                      if (key === "skills") {
                        let skillsArray = value;
                        if (typeof value === "string") {
                          try {
                            skillsArray = JSON.parse(value);
                          } catch (e) {
                            skillsArray = [];
                            console.error("Failed to parse skills JSON:", e);
                          }
                        }
                        if (Array.isArray(skillsArray)) {
                          return (
                            <div
                              key={key}
                              className="border-border/50 bg-muted/30 hover:border-primary/30 hover:bg-muted/50 flex flex-col gap-2 rounded-lg border p-4 transition-all"
                            >
                              <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                                <AttributeIcon className={`h-3 w-3 ${color}`} />
                                Skills
                              </div>
                              <div className="space-y-2">
                                {skillsArray.map(
                                  (
                                    skill: { name: string; level: number },
                                    index: number,
                                  ) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between"
                                    >
                                      <span className="text-foreground text-sm">
                                        {skill.name}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <div className="bg-muted h-2 w-16 overflow-hidden rounded-full">
                                          <div
                                            className="bg-primary h-full"
                                            style={{ width: `${skill.level}%` }}
                                          />
                                        </div>
                                        <span className="text-muted-foreground text-xs">
                                          {skill.level}
                                        </span>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          );
                        }
                      }

                      return (
                        <div
                          key={key}
                          className={`flex flex-col gap-2 rounded-lg border p-4 transition-all ${
                            isFlaw
                              ? "border-red-500/20 bg-red-500/5 hover:border-red-500/30 hover:bg-red-500/10"
                              : "border-border/50 bg-muted/30 hover:border-primary/30 hover:bg-muted/50"
                          }`}
                        >
                          <div
                            className={`flex items-center gap-2 text-sm font-medium ${
                              isFlaw ? "text-red-500" : "text-muted-foreground"
                            }`}
                          >
                            <AttributeIcon className={`h-3 w-3 ${color}`} />
                            {key
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </div>
                          <p
                            className={`text-sm leading-relaxed ${
                              isFlaw ? "text-red-400" : "text-foreground"
                            }`}
                          >
                            {String(value)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </article>
  );
}
