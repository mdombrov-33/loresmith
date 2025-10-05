import { Button } from "@/components/ui/button";
import { RotateCw, ArrowRight, Check, Sparkles } from "lucide-react";

interface ActionButtonsProps {
  hasSelection: boolean;
  hasRegenerated: boolean;
  isLoading: boolean;
  isLastStage: boolean;
  onRegenerate: () => void;
  onNext: () => void;
}

export function ActionButtons({
  hasSelection,
  hasRegenerated,
  isLoading,
  isLastStage,
  onRegenerate,
  onNext,
}: ActionButtonsProps) {
  return (
    <div className="mt-8 flex items-center justify-between gap-4">
      {/* Regenerate Button */}
      <Button
        variant="outline"
        size="lg"
        onClick={onRegenerate}
        disabled={hasRegenerated || isLoading}
        className="gap-2"
      >
        {hasRegenerated ? (
          <>
            <Check className="h-4 w-4" />
            Used
          </>
        ) : (
          <>
            <RotateCw className="h-4 w-4" />
            Regenerate Once
          </>
        )}
      </Button>

      {/* Next Button */}
      <Button
        variant="default"
        size="lg"
        onClick={onNext}
        disabled={!hasSelection || isLoading}
        className="gap-2"
      >
        {isLastStage ? (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Full Story
          </>
        ) : (
          <>
            Continue to Next
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
