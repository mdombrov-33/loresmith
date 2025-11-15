import ActionButton from "@/components/shared/ActionButton";
import { ArrowRight, Sparkles, RotateCw } from "lucide-react";

interface GenerateActionsProps {
  hasSelection: boolean;
  isLoading: boolean;
  isLastStage: boolean;
  onRegenerate: () => void;
  onNext: () => void;
}

export default function GenerateActions({
  hasSelection,
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
        disabled={isLoading}
        icon={<RotateCw className="h-4 w-4" />}
      >
        Regenerate
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
