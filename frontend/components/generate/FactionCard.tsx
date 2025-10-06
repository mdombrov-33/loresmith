import { LorePiece } from "@/types/generate-world";

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
  return (
    <div
      onClick={onSelect}
      className={`bg-card hover:border-primary cursor-pointer rounded-xl border p-6 transition-all hover:-translate-y-1 hover:shadow-lg ${isSelected ? "border-primary from-primary/10 to-accent/10 bg-gradient-to-br shadow-lg" : "border-border"} `}
    >
      {/* Title + Type Badge */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-foreground text-xl font-semibold">
          {faction.name}
        </h3>
        <span className="text-accent bg-accent/10 rounded px-2 py-1 text-xs font-semibold uppercase">
          Faction
        </span>
      </div>

      {/* Description */}
      <p className="text-muted-foreground mb-4 text-sm">
        {faction.description}
      </p>

      {/* Details */}
      <div className="border-border space-y-3 border-t pt-4">
        {/* Ideology */}
        <div>
          <div className="text-accent mb-1 text-xs font-semibold uppercase">
            Ideology
          </div>
          <div className="text-foreground text-sm">
            {faction.details.ideology}
          </div>
        </div>

        {/* Appearance */}
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
}
