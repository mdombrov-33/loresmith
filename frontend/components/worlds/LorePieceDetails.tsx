import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertTriangle } from "lucide-react";
import { LorePiece } from "@/lib/schemas";
import { getAttributeIcon } from "@/constants/lore";
import {
  getTraitIcon,
  getTraitColor,
  getTraitDescription,
} from "@/lib/trait-icons";

interface LorePieceDetailsProps {
  piece: LorePiece;
  displayNames: Record<string, string>;
  sortDetails: (details: Record<string, unknown>) => [string, unknown][];
}

export default function LorePieceDetails({
  piece,
  displayNames,
  sortDetails,
}: LorePieceDetailsProps) {
  const sortedDetails = sortDetails(piece.details).filter(
    ([key]) => key !== "image" && key !== "image_portrait" && key !== "image_portrait_base64" && key !== "is_protagonist"
  );

  const characterImage = (piece.details.image_portrait || piece.details.image) as string | undefined;

  return (
    <div className="space-y-6 pt-4">
      {/* Character Portrait */}
      {piece.type === "character" && characterImage && (
        <div className="flex justify-center">
          <div className="border-primary/30 relative h-48 w-48 overflow-hidden rounded-lg border-2 shadow-lg">
            <Image
              src={characterImage}
              alt={piece.name}
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <p className="text-foreground leading-relaxed">{piece.description}</p>
      </div>

      {/* Details */}
      <div className="space-y-4">
        {sortedDetails.map(([key, value]) => {
          const { icon: AttrIcon, color } = getAttributeIcon(key);

          // Handle flaw specially
          if (key === "flaw") {
            // Value might be object (from DB) or JSON string (from full_story)
            let flaw = value;
            if (typeof value === 'string') {
              try {
                flaw = JSON.parse(value);
              } catch {
                // Display as string if parsing fails
                return (
                  <div
                    key={key}
                    className="border-destructive/20 bg-destructive/5 rounded-lg border p-4"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <AlertTriangle className="text-destructive h-4 w-4" />
                      <span className="text-destructive text-sm font-semibold uppercase tracking-wide">
                        Flaw
                      </span>
                    </div>
                    <p className="text-destructive/90 text-sm">{String(value)}</p>
                  </div>
                );
              }
            }

            if (typeof flaw === 'object' && flaw !== null) {
              return (
                <div
                  key={key}
                  className="border-destructive/20 bg-destructive/5 rounded-lg border p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <AlertTriangle className="text-destructive h-5 w-5" />
                    <span className="text-destructive text-lg font-bold">
                      {flaw.name || "Flaw"}
                    </span>
                  </div>
                  <p className="text-destructive/90 text-sm leading-relaxed">
                    {flaw.description}
                  </p>
                </div>
              );
            }
          }

          // Handle traits
          if (key === "traits") {
            // Value might be array (from DB) or JSON string (from full_story)
            let traits = value;
            if (typeof value === 'string') {
              try {
                traits = JSON.parse(value);
              } catch {
                // Fall through to default rendering
              }
            }

            if (Array.isArray(traits)) {
              return (
                <div key={key}>
                  <div className="mb-2 flex items-center gap-2">
                    {AttrIcon && <AttrIcon className={`h-4 w-4 ${color}`} />}
                    <span className="text-foreground text-sm font-semibold uppercase tracking-wide">
                      {displayNames[key] || key}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <TooltipProvider>
                      {traits.map((trait: string, idx: number) => {
                        const TraitIcon = getTraitIcon(trait);
                        const traitColor = getTraitColor(trait);
                        const description = getTraitDescription(trait);

                        return (
                          <Tooltip key={idx}>
                            <TooltipTrigger>
                              <Badge variant="outline" className={`${traitColor} gap-1.5`}>
                                {TraitIcon && <TraitIcon className="h-3 w-3" />}
                                {trait}
                              </Badge>
                            </TooltipTrigger>
                            {description && (
                              <TooltipContent>
                                <p className="max-w-xs">{description}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        );
                      })}
                    </TooltipProvider>
                  </div>
                </div>
              );
            }
          }

          // Handle skills
          if (key === "skills") {
            // Value might be array (from DB) or JSON string (from full_story)
            let skills = value;
            if (typeof value === 'string') {
              try {
                skills = JSON.parse(value);
              } catch {
                // Fall through to default rendering
              }
            }

            if (Array.isArray(skills)) {
              return (
                <div key={key}>
                  <div className="mb-2 flex items-center gap-2">
                    {AttrIcon && <AttrIcon className={`h-4 w-4 ${color}`} />}
                    <span className="text-foreground text-sm font-semibold uppercase tracking-wide">
                      {displayNames[key] || key}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill: string, idx: number) => (
                      <Badge key={idx} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            }
          }

          // Default rendering
          return (
            <div key={key}>
              <div className="mb-2 flex items-center gap-2">
                {AttrIcon && <AttrIcon className={`h-4 w-4 ${color}`} />}
                <span className="text-foreground text-sm font-semibold uppercase tracking-wide">
                  {displayNames[key] || key}
                </span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{String(value)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
