import { Sparkles } from "lucide-react";
import { LOADING_MESSAGES } from "@/constants/loading-messages";

interface GenerateOverlayProps {
  isPending: boolean;
  currentMessage: number;
}

export default function GenerateOverlay({
  isPending,
  currentMessage,
}: GenerateOverlayProps) {
  if (!isPending) return null;

  return (
    <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="border-primary/20 border-t-primary h-24 w-24 animate-spin rounded-full border-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="text-primary h-8 w-8" />
            </div>
          </div>
        </div>
        <h2 className="text-foreground mb-4 text-2xl font-bold">
          {LOADING_MESSAGES[currentMessage]}
        </h2>
        <p className="text-muted-foreground">
          Weaving your chosen elements into an epic adventure...
        </p>
      </div>
    </div>
  );
}
