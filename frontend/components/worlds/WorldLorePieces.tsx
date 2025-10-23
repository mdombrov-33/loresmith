import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ActionButton from "@/components/shared/ActionButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollText, Eye } from "lucide-react";
import { LorePiece } from "@/types/api";

interface WorldLorePiecesProps {
  lorePieces: LorePiece[];
  displayNames: Record<string, string>;
  truncateText: (text: string, maxLength?: number) => string;
  sortDetails: (details: Record<string, unknown>) => [string, unknown][];
}

export default function WorldLorePieces({
  lorePieces,
  displayNames,
  truncateText,
  sortDetails,
}: WorldLorePiecesProps) {
  return (
    <Card className="p-6">
      <CardTitle className="mb-4 flex items-center gap-2 text-xl">
        <ScrollText className="text-primary h-5 w-5" />
        Your World
      </CardTitle>
      <div className="grid gap-4 md:grid-cols-2">
        {lorePieces?.map((piece) => (
          <Card key={piece.id} className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline">
                {displayNames[piece.type] ||
                  piece.type.charAt(0).toUpperCase() + piece.type.slice(1)}
              </Badge>
              <span className="font-bold">{piece.name}</span>
            </div>
            <div className="text-muted-foreground mb-2 text-sm">
              {truncateText(piece.description)}
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <ActionButton
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/80 h-auto p-0"
                  icon={<Eye className="h-4 w-4" />}
                >
                  Read More
                </ActionButton>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Badge variant="outline">
                      {displayNames[piece.type] ||
                        piece.type.charAt(0).toUpperCase() +
                          piece.type.slice(1)}
                    </Badge>
                    {piece.name}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-semibold">Description</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {piece.description}
                    </p>
                  </div>
                  {piece.details && Object.keys(piece.details).length > 0 && (
                    <div>
                      <h4 className="mb-4 font-semibold">Details</h4>
                      <div className="space-y-3">
                        {sortDetails(piece.details).map(([key, value]) => (
                          <div key={key} className="bg-muted/50 rounded-lg p-3">
                            <div className="space-y-2">
                              <span className="text-sm font-medium capitalize">
                                {key.replace(/_/g, " ")}:
                              </span>
                              <p className="text-muted-foreground text-sm leading-relaxed">
                                {String(value)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </Card>
        ))}
      </div>
    </Card>
  );
}
