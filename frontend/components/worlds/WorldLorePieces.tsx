"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Scroll,
  Users,
  MapPin,
  Calendar,
  Gem,
  Shield,
  Eye,
  ChevronRight,
  Sparkles,
  BookOpen,
  Zap,
  Heart,
  Brain,
  Lightbulb,
  Crown,
} from "lucide-react";
import { LorePiece } from "@/types/api";

interface WorldLorePiecesProps {
  lorePieces: LorePiece[];
  displayNames: Record<string, string>;
  sortDetails: (details: Record<string, unknown>) => [string, unknown][];
}

const loreIcons: Record<string, React.ElementType> = {
  characters: Users,
  factions: Shield,
  settings: MapPin,
  events: Calendar,
  relics: Gem,
};

const getAttributeIcon = (key: string) => {
  const iconMap: Record<string, { icon: React.ElementType; color: string }> = {
    health: { icon: Heart, color: "text-red-500" },
    stress: { icon: Brain, color: "text-blue-500" },
    "lore mastery": { icon: BookOpen, color: "text-yellow-500" },
    empathy: { icon: Users, color: "text-pink-500" },
    resilience: { icon: Shield, color: "text-green-500" },
    creativity: { icon: Lightbulb, color: "text-orange-500" },
    influence: { icon: Crown, color: "text-purple-500" },
  };

  const normalizedKey = key.toLowerCase().replace(/_/g, " ");
  return iconMap[normalizedKey] || { icon: Zap, color: "text-primary" };
};

export default function WorldLorePieces({
  lorePieces,
  displayNames,
  sortDetails,
}: WorldLorePiecesProps) {
  const groupedPieces = lorePieces.reduce(
    (acc, piece) => {
      if (!acc[piece.type]) acc[piece.type] = [];
      acc[piece.type].push(piece);
      return acc;
    },
    {} as Record<string, LorePiece[]>,
  );

  const allTypes = Object.keys(groupedPieces);

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
        <CardContent className="pt-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 flex w-full flex-wrap justify-start gap-2">
              <TabsTrigger value="all" className="gap-2">
                <Sparkles className="h-4 w-4" />
                All
              </TabsTrigger>
              {allTypes.map((type) => {
                const Icon = loreIcons[type] || Scroll;
                return (
                  <TabsTrigger key={type} value={type} className="gap-2">
                    <Icon className="h-4 w-4" />
                    {displayNames[type] || type}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                {lorePieces.map((piece) => (
                  <LorePieceCard
                    key={piece.id}
                    piece={piece}
                    displayNames={displayNames}
                    sortDetails={sortDetails}
                  />
                ))}
              </div>
            </TabsContent>

            {allTypes.map((type) => (
              <TabsContent key={type} value={type} className="space-y-4">
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                  {groupedPieces[type].map((piece) => (
                    <LorePieceCard
                      key={piece.id}
                      piece={piece}
                      displayNames={displayNames}
                      sortDetails={sortDetails}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
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
                View Details
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
                      const { icon: AttributeIcon, color } =
                        getAttributeIcon(key);
                      return (
                        <div
                          key={key}
                          className="border-border/50 bg-muted/30 hover:border-primary/30 hover:bg-muted/50 flex flex-col gap-2 rounded-lg border p-4 transition-all"
                        >
                          <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                            <AttributeIcon className={`h-3 w-3 ${color}`} />
                            {key
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </div>
                          <p className="text-foreground text-sm leading-relaxed">
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
