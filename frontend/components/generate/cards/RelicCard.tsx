import { LorePiece } from "@/types/generate-world";

interface RelicCardProps {
  relic: LorePiece;
  isSelected: boolean;
  onSelect: () => void;
}

export default function RelicCard({
  relic,
  isSelected,
  onSelect,
}: RelicCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`bg-card hover:border-primary cursor-pointer rounded-xl border p-6 transition-all hover:-translate-y-1 hover:shadow-lg ${isSelected ? "border-primary from-primary/10 to-accent/10 bg-gradient-to-br shadow-lg" : "border-border"} `}
    >
      {/* Title + Type Badge */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-foreground text-xl font-semibold">{relic.name}</h3>
        <span className="text-accent bg-accent/10 rounded px-2 py-1 text-xs font-semibold uppercase">
          Relic
        </span>
      </div>

      {/* Description */}
      <p className="text-muted-foreground mb-4 text-sm">{relic.description}</p>

      {/* Details */}
      <div className="border-border space-y-3 border-t pt-4">
        {/* History */}
        <div>
          <div className="text-accent mb-1 text-xs font-semibold uppercase">
            History
          </div>
          <div className="text-foreground text-sm">{relic.details.history}</div>
        </div>
      </div>
    </div>
  );
}
