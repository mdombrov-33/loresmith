import { LorePiece } from "@/types/generate-world";
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
} from "lucide-react";

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
          <div className="text-accent mb-2 text-xs font-semibold uppercase">
            Skills
          </div>
          <div className="space-y-2">
            {character.details.skills.split(", ").map((skill, index) => {
              const match = skill.match(/^(.+?)\s*\((\d+)\)$/);
              if (!match) return null;
              const name = match[1].trim();
              const level = parseInt(match[2]);
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-foreground text-sm">{name}</span>
                  <div className="flex items-center gap-2">
                    <div className="bg-muted h-2 w-16 overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full"
                        style={{ width: `${level}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {level}
                    </span>
                  </div>
                </div>
              );
            })}
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex cursor-help items-center gap-1">
                    <Heart className="h-3 w-3 text-red-500" />
                    <div className="text-muted-foreground text-xs">Health</div>
                    <div className="text-success text-sm font-semibold">
                      {character.details.health}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Represents physical well-being. Determines survival in
                    challenges.
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex cursor-help items-center gap-1">
                    <Brain className="h-3 w-3 text-blue-500" />
                    <div className="text-muted-foreground text-xs">Stress</div>
                    <div className="text-warning text-sm font-semibold">
                      {character.details.stress}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Represents mental strain. Affects decision-making and
                    stability.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Custom Stats */}
          <div className="grid grid-cols-3 gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex cursor-help items-center gap-1">
                    <BookOpen className="h-3 w-3 text-yellow-500" />
                    <div className="text-muted-foreground text-xs">
                      Lore Mastery
                    </div>
                    <div className="text-foreground text-sm font-semibold">
                      {character.details.lore_mastery}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Represents knowledge of history and myths. Improves
                    storytelling abilities.
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex cursor-help items-center gap-1">
                    <Users className="h-3 w-3 text-pink-500" />
                    <div className="text-muted-foreground text-xs">Empathy</div>
                    <div className="text-foreground text-sm font-semibold">
                      {character.details.empathy}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Represents understanding of emotions and relationships. Aids
                    character interactions.
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex cursor-help items-center gap-1">
                    <Shield className="h-3 w-3 text-green-500" />
                    <div className="text-muted-foreground text-xs">
                      Resilience
                    </div>
                    <div className="text-foreground text-sm font-semibold">
                      {character.details.resilience}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Represents physical and mental endurance. Handles stress and
                    adversity.
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex cursor-help items-center gap-1">
                    <Lightbulb className="h-3 w-3 text-orange-500" />
                    <div className="text-muted-foreground text-xs">
                      Creativity
                    </div>
                    <div className="text-foreground text-sm font-semibold">
                      {character.details.creativity}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Represents imaginative problem-solving. Generates unique and
                    innovative ideas.
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex cursor-help items-center gap-1">
                    <Crown className="h-3 w-3 text-purple-500" />
                    <div className="text-muted-foreground text-xs">
                      Influence
                    </div>
                    <div className="text-foreground text-sm font-semibold">
                      {character.details.influence}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Represents social persuasion and charisma. Affects alliances
                    and negotiations.
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex cursor-help items-center gap-1">
                    <Eye className="h-3 w-3 text-indigo-500" />
                    <div className="text-muted-foreground text-xs">
                      Perception
                    </div>
                    <div className="text-foreground text-sm font-semibold">
                      {character.details.perception}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Represents awareness of details and clues. Enhances
                    exploration.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
