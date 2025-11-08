import ActionButton from "@/components/shared/ActionButton";
import { RotateCw, ArrowRight, Check, Sparkles } from "lucide-react";

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
        variant="outline"
        size="lg"
        onClick={onRegenerate}
        disabled={hasRegenerated || isLoading}
        icon={hasRegenerated ? <Check className="h-4 w-4" /> : <RotateCw className="h-4 w-4" />}
      >
        {hasRegenerated ? "Used" : "Regenerate Once"}
      </ActionButton>

      <ActionButton
        variant="default"
        size="lg"
        onClick={onNext}
        disabled={!hasSelection || isLoading}
        icon={isLastStage ? <Sparkles className="h-4 w-4" /> : undefined}
      >
        {isLastStage ? (
          "Generate Full Story"
        ) : (
          <>
            Continue to Next
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </ActionButton>
    </section>
  );
}
