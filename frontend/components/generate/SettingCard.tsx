import { LorePiece } from "@/types/generate-world";

interface SettingCardProps {
  setting: LorePiece;
  isSelected: boolean;
  onSelect: () => void;
}

export default function SettingCard({
  setting,
  isSelected,
  onSelect,
}: SettingCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`bg-card hover:border-primary cursor-pointer rounded-xl border p-6 transition-all hover:-translate-y-1 hover:shadow-lg ${isSelected ? "border-primary from-primary/10 to-accent/10 bg-gradient-to-br shadow-lg" : "border-border"} `}
    >
      {/* Title + Type Badge */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-foreground text-xl font-semibold">
          {setting.name}
        </h3>
        <span className="text-accent bg-accent/10 rounded px-2 py-1 text-xs font-semibold uppercase">
          Setting
        </span>
      </div>

      {/* Description */}
      <p className="text-muted-foreground mb-4 text-sm">
        {setting.description}
      </p>

      {/* Details */}
      <div className="border-border space-y-3 border-t pt-4">
        {/* Landscape */}
        <div>
          <div className="text-accent mb-1 text-xs font-semibold uppercase">
            Landscape
          </div>
          <div className="text-foreground text-sm">
            {setting.details.landscape}
          </div>
        </div>

        {/* Dangers */}
        <div>
          <div className="text-accent mb-1 text-xs font-semibold uppercase">
            Dangers
          </div>
          <div className="text-foreground text-sm">
            {setting.details.dangers}
          </div>
        </div>
      </div>
    </div>
  );
}
