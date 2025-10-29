import { LorePiece } from "@/types/generate-world";
import { RotateCw } from "lucide-react";
import FlipCard from "@/components/shared/FlipCard";
import SelectionEffect from "@/components/shared/SelectionEffect";

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
  const frontContent = (
    <div
      className={`bg-card flex h-full flex-col rounded-xl border p-6 ${isSelected ? "border-primary from-primary/10 to-accent/10 bg-gradient-to-br shadow-lg" : "border-border"}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-foreground text-xl font-semibold">
          {setting.name}
        </h3>
        <span className="text-accent bg-accent/10 rounded px-2 py-1 text-xs font-semibold uppercase">
          Setting
        </span>
      </div>

      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
        {setting.description}
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
          {setting.name}
        </h3>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-accent mb-1 text-xs font-semibold uppercase">
            Landscape
          </div>
          <div className="text-foreground text-sm">
            {setting.details.landscape}
          </div>
        </div>

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
