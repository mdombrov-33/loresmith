import ActionButton from "@/components/generate/ActionButton";

interface GenerateActionsProps {
  hasSelection: boolean;
  hasRegenerated: boolean;
  isLoading: boolean;
  isLastStage: boolean;
  onRegenerate: () => void;
  onNext: () => void;
}

export default function GenerateActions({
  hasSelection,
  hasRegenerated,
  isLoading,
  isLastStage,
  onRegenerate,
  onNext,
}: GenerateActionsProps) {
  return (
    <section className="mt-8 flex items-center justify-between gap-4">
      <ActionButton
        type="regenerate"
        hasSelection={hasSelection}
        hasRegenerated={hasRegenerated}
        isLoading={isLoading}
        isLastStage={isLastStage}
        onRegenerate={onRegenerate}
        onNext={onNext}
      />
      <ActionButton
        type="next"
        hasSelection={hasSelection}
        hasRegenerated={hasRegenerated}
        isLoading={isLoading}
        isLastStage={isLastStage}
        onRegenerate={onRegenerate}
        onNext={onNext}
      />
    </section>
  );
}
