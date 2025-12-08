import SharedActionButton from "@/components/shared/buttons/ActionButton";
import { AlertCircle, RotateCw } from "lucide-react";

interface GenerateErrorProps {
  error: string | null;
  isLoading: boolean;
  onRefetch: () => void;
}

export default function GenerateError({
  error,
  isLoading,
  onRefetch,
}: GenerateErrorProps) {
  // Don't show error while loading (new job is running)
  if (!error || isLoading) return null;

  return (
    <section className="bg-destructive/10 border-destructive mb-8 rounded-lg border p-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="text-destructive mt-0.5 h-5 w-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-destructive mb-1 font-semibold">Generation Failed</p>
          <p className="text-destructive/90 mb-4 text-sm">{error}</p>
          <SharedActionButton
            onClick={onRefetch}
            variant="destructive"
            size="default"
            icon={<RotateCw className="h-4 w-4" />}
          >
            Retry Generation
          </SharedActionButton>
        </div>
      </div>
    </section>
  );
}
