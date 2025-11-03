import { LorePiece } from "@/types/generate-world";
import { RotateCw } from "lucide-react";
import FlipCard from "@/components/generate/FlipCard";
import SelectionEffect from "@/components/generate/SelectionEffect";

interface FactionCardProps {
  faction: LorePiece;
  isSelected: boolean;
  onSelect: () => void;
}

export default function FactionCard({
  faction,
  isSelected,
  onSelect,
}: FactionCardProps) {
  const frontContent = (
    <div
      className={`bg-card flex h-full flex-col rounded-xl border p-6 ${isSelected ? "border-primary from-primary/10 to-accent/10 bg-gradient-to-br shadow-lg" : "border-border"}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-foreground text-xl font-semibold">
          {faction.name}
        </h3>
        <span className="text-accent bg-accent/10 rounded px-2 py-1 text-xs font-semibold uppercase">
          Faction
        </span>
      </div>

      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
        {faction.description}
      </p>

      <div className="bg-primary/5 border-primary/20 mt-auto flex items-center justify-center gap-2 rounded-lg border p-3">
        <RotateCw className="text-primary h-4 w-4" />
        <span className="text-muted-foreground text-xs">
          Hover to see full details
        </span>
      </div>
    </div>
  );

  const backContent = (
    <div
      className={`bg-card h-full overflow-y-auto rounded-xl border p-6 ${isSelected ? "border-primary from-primary/10 to-accent/10 bg-gradient-to-br shadow-lg" : "border-border"}`}
    >
      <div className="mb-3">
        <h3 className="text-foreground text-xl font-semibold">
          {faction.name}
        </h3>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-accent mb-1 text-xs font-semibold uppercase">
            Ideology
          </div>
          <div className="text-foreground text-sm">
            {faction.details.ideology}
          </div>
        </div>

        <div>
          <div className="text-accent mb-1 text-xs font-semibold uppercase">
            Appearance
          </div>
          <div className="text-foreground text-sm">
            {faction.details.appearance}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative h-full">
      <FlipCard
        frontContent={frontContent}
        backContent={backContent}
        isSelected={isSelected}
        onClick={onSelect}
      />
      <SelectionEffect isActive={isSelected} />
    </div>
  );
}
