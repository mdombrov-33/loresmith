import { LorePiece } from "@/lib/schemas";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HelpCircle,
  Heart,
  Brain,
  BookOpen,
  Users,
  Shield,
  Lightbulb,
  Crown,
  Eye,
  AlertTriangle,
  RotateCw,
} from "lucide-react";
import FlipCard from "@/components/generate/FlipCard";
import SelectionEffect from "@/components/generate/SelectionEffect";
import {
  getTraitIcon,
  getTraitColor,
  getTraitDescription,
} from "@/lib/trait-icons";
import StatItem from "@/components/shared/card/StatItem";
import CardImage from "@/components/shared/card/CardImage";

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
  const skills = Array.isArray(character.details.skills)
    ? character.details.skills
    : [];

  //* Common card border styling
  const borderClass = isSelected
    ? "border-primary shadow-primary/20 shadow-lg"
    : "border-border";

  //* Front side: Basic info
  const frontContent = (
    <div
      className={`bg-card flex h-full flex-col rounded-xl border-2 transition-all ${borderClass}`}
    >
      <CardImage
        src={character.details.image_portrait}
        alt={character.name}
        objectFit="contain"
        height="h-44"
      />

      <div className="flex flex-col p-4 flex-1 min-h-0">
        {/* Title + Type Badge */}
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-foreground text-lg font-semibold">
            {character.name}
          </h3>
          <span className="text-accent bg-accent/10 rounded px-2 py-1 text-xs font-semibold uppercase">
            Character
          </span>
        </div>

        {/* Description (Backstory) */}
        <p className="text-muted-foreground mb-3 text-sm leading-relaxed flex-1 overflow-y-auto">
          {character.description}
        </p>

        {/* Hover hint - pushed to bottom */}
        <div className="bg-primary/5 border-primary/20 mt-auto flex items-center justify-center gap-2 rounded-lg border p-2">
          <RotateCw className="text-primary h-4 w-4" />
          <span className="text-muted-foreground text-xs">
            Hover to see full details
          </span>
        </div>
      </div>
    </div>
  );

  //* Back side: Detailed info
  const backContent = (
    <div
      className={`bg-card flex h-full flex-col rounded-xl border-2 transition-all ${borderClass}`}
    >
      <div className="flex-1 overflow-y-auto min-h-0">
        <CardImage
          src={character.details.image_portrait}
          alt={character.name}
          objectFit="contain"
          height="h-48"
          className="mb-4"
        />
        <div className="px-4">
        {/* Title */}
        <div className="mb-3">
          <h3 className="text-foreground text-xl font-semibold">
            {character.name}
          </h3>
        </div>

        {/* Details */}
        <div className="space-y-3">
        {/* Personality Traits */}
        {character.details.traits && Array.isArray(character.details.traits) && (
          <div>
            <div className="text-accent mb-2 text-xs font-semibold uppercase">
              Personality Traits
            </div>
            <div className="flex flex-wrap gap-2">
              {character.details.traits.map((trait: string, index: number) => {
                const TraitIcon = getTraitIcon(trait);
                const colorClass = getTraitColor(trait);
                const description = getTraitDescription(trait);
                return (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-muted/50 border-border flex cursor-help items-center gap-1.5 rounded-lg border px-3 py-1.5">
                          <TraitIcon className={`h-4 w-4 ${colorClass}`} />
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
        )}

        {/* Appearance */}
        <div>
          <div className="text-accent mb-1 text-xs font-semibold uppercase">
            Appearance
          </div>
          <div className="text-foreground text-sm">
            {character.details.appearance}
          </div>
        </div>

        {/* Flaw */}
        {character.details.flaw && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 cursor-help">
                  <div className="mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                    <div className="text-xs font-semibold text-red-500 uppercase">
                      Flaw
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-red-400">
                    {typeof character.details.flaw === 'string'
                      ? character.details.flaw.split('|')[0].trim()
                      : character.details.flaw.name}
                  </div>
                  <div className="text-xs text-red-300/70 mt-0.5">
                    {typeof character.details.flaw === 'object' && character.details.flaw.description}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1.5">
                  <div>
                    <span className="font-semibold">Trigger:</span>{" "}
                    <span className="text-muted-foreground">
                      {typeof character.details.flaw === 'object'
                        ? character.details.flaw.trigger?.replace(/,/g, ', ')
                        : 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Penalty:</span>{" "}
                    <span className="text-muted-foreground">
                      {typeof character.details.flaw === 'object'
                        ? character.details.flaw.penalty
                        : 'Unknown'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Duration:</span>{" "}
                    <span className="text-muted-foreground">
                      {typeof character.details.flaw === 'object'
                        ? character.details.flaw.duration
                        : 'Unknown'}
                    </span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Skills */}
        <div>
          <div className="text-accent mb-2 text-xs font-semibold uppercase">
            Skills
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="bg-accent/10 text-accent rounded-full px-3 py-1 text-xs font-medium"
                >
                  {skill}
                </span>
              ))
            ) : (
              <div className="text-muted-foreground text-sm">
                No skills available
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3 pt-2">
          {/* Attributes Header */}
          <div className="text-accent flex items-center gap-1 text-xs font-semibold uppercase">
            Attributes
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="text-muted-foreground h-3 w-3" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Hover over attribute to see details.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Health and Stress */}
          <div className="flex gap-4">
            <StatItem
              icon={Heart}
              iconColor="text-red-500"
              label="Health"
              value={character.details.health}
              valueColor="text-success"
              tooltip="Represents physical well-being. Determines survival in challenges."
            />
            <StatItem
              icon={Brain}
              iconColor="text-blue-500"
              label="Stress"
              value={character.details.stress}
              valueColor="text-warning"
              tooltip="Represents mental strain. Affects decision-making and stability."
            />
          </div>

          {/* Custom Stats */}
          <div className="grid grid-cols-3 gap-4">
            <StatItem
              icon={BookOpen}
              iconColor="text-yellow-500"
              label="Knowledge"
              value={character.details.knowledge}
              tooltip="Represents knowledge of history and myths. Improves storytelling abilities."
            />
            <StatItem
              icon={Users}
              iconColor="text-pink-500"
              label="Empathy"
              value={character.details.empathy}
              tooltip="Represents understanding of emotions and relationships. Aids character interactions."
            />
            <StatItem
              icon={Shield}
              iconColor="text-green-500"
              label="Resilience"
              value={character.details.resilience}
              tooltip="Represents physical and mental endurance. Handles stress and adversity."
            />
            <StatItem
              icon={Lightbulb}
              iconColor="text-orange-500"
              label="Creativity"
              value={character.details.creativity}
              tooltip="Represents imaginative problem-solving. Generates unique and innovative ideas."
            />
            <StatItem
              icon={Crown}
              iconColor="text-purple-500"
              label="Influence"
              value={character.details.influence}
              tooltip="Represents social persuasion and charisma. Affects alliances and negotiations."
            />
            <StatItem
              icon={Eye}
              iconColor="text-indigo-500"
              label="Perception"
              value={character.details.perception}
              tooltip="Represents awareness of details and clues. Enhances exploration."
            />
          </div>
        </div>
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
