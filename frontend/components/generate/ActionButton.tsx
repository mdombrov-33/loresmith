import { Button } from "@/components/ui/button";
import { RotateCw, ArrowRight, Check, Sparkles } from "lucide-react";

interface ActionButtonProps {
  type: "regenerate" | "next";
  hasSelection: boolean;
  hasRegenerated: boolean;
  isLoading: boolean;
  isLastStage: boolean;
  onRegenerate: () => void;
  onNext: () => void;
}

export default function ActionButton({
  type,
  hasSelection,
  hasRegenerated,
  isLoading,
  isLastStage,
  onRegenerate,
  onNext,
}: ActionButtonProps) {
  if (type === "regenerate") {
    return (
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
    );
  }

  if (type === "next") {
    return (
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
    );
  }

  return null;
}
