import { GenerationStage, LorePiece } from "@/types/generate-world";
import CharacterCard from "@/components/generate/cards/CharacterCard";
import FactionCard from "@/components/generate/cards/FactionCard";
import SettingCard from "@/components/generate/cards/SettingCard";
import EventCard from "@/components/generate/cards/EventCard";
import RelicCard from "@/components/generate/cards/RelicCard";
import StaggeredReveal from "@/components/shared/StaggeredReveal";

interface GenerateGridProps {
  generatedOptions: LorePiece[];
  selectedIndex: number | null;
  stage: GenerationStage;
  onSelectCard: (index: number) => void;
}

export default function GenerateGrid({
  generatedOptions,
  selectedIndex,
  stage,
  onSelectCard,
}: GenerateGridProps) {
  if (generatedOptions.length === 0) return null;

  const renderCard = (option: LorePiece, index: number) => {
    const isSelected = selectedIndex === index;
    const onSelect = () => onSelectCard(index);

    switch (stage) {
      case "characters":
        return (
          <CharacterCard
            key={index}
            character={option}
            isSelected={isSelected}
            onSelect={onSelect}
          />
        );
      case "factions":
        return (
          <FactionCard
            key={index}
            faction={option}
            isSelected={isSelected}
            onSelect={onSelect}
          />
        );
      case "settings":
        return (
          <SettingCard
            key={index}
            setting={option}
            isSelected={isSelected}
            onSelect={onSelect}
          />
        );
      case "events":
        return (
          <EventCard
            key={index}
            event={option}
            isSelected={isSelected}
            onSelect={onSelect}
          />
        );
      case "relics":
        return (
          <RelicCard
            key={index}
            relic={option}
            isSelected={isSelected}
            onSelect={onSelect}
          />
        );
      default:
        return null;
    }
  };

  return (
    <section className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {generatedOptions.map((option, index) => (
        <StaggeredReveal key={index} index={index} className="min-h-[550px]">
          {renderCard(option, index)}
        </StaggeredReveal>
      ))}
    </section>
  );
}
