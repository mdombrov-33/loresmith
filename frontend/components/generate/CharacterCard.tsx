import { LorePiece } from "@/types/generate-world";

interface CharacterCardProps {
  character: LorePiece;
  isSelected: boolean;
  onSelect: () => void;
}

export default function CharacterCard({
  character,
  isSelected,
  onSelect,
}: CharacterCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`bg-card hover:border-primary cursor-pointer rounded-xl border p-6 transition-all hover:-translate-y-1 hover:shadow-lg ${isSelected ? "border-primary from-primary/10 to-accent/10 bg-gradient-to-br shadow-lg" : "border-border"} `}
    >
      {/* Title + Type Badge */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-foreground text-xl font-semibold">
          {character.name}
        </h3>
        <span className="text-accent bg-accent/10 rounded px-2 py-1 text-xs font-semibold uppercase">
          Character
        </span>
      </div>

      {/* Description (Backstory) */}
      <p className="text-muted-foreground mb-4 text-sm">
        {character.description}
      </p>

      {/* Details */}
      <div className="border-border space-y-3 border-t pt-4">
        {/* Personality */}
        <div>
          <div className="text-accent mb-1 text-xs font-semibold uppercase">
            Personality
          </div>
          <div className="text-foreground text-sm">
            {character.details.personality}
          </div>
        </div>

        {/* Appearance */}
        <div>
          <div className="text-accent mb-1 text-xs font-semibold uppercase">
            Appearance
          </div>
          <div className="text-foreground text-sm">
            {character.details.appearance}
          </div>
        </div>

        {/* Skills */}
        <div>
          <div className="text-accent mb-1 text-xs font-semibold uppercase">
            Skills
          </div>
          <div className="text-foreground text-sm">
            {character.details.skills}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 pt-2">
          <div>
            <div className="text-muted-foreground text-xs">Health</div>
            <div className="text-success text-sm font-semibold">
              {character.details.health}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Stress</div>
            <div className="text-warning text-sm font-semibold">
              {character.details.stress}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
