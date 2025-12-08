import { Job } from "@/lib/api/jobs";
import { Loader2 } from "lucide-react";

interface GenerateLoadingProps {
  isLoading: boolean;
  category: string;
  job?: Job;
}

export default function GenerateLoading({
  isLoading,
  category,
  job,
}: GenerateLoadingProps) {
  // Don't show loading if job failed (error will be shown via GenerateError)
  if (!isLoading || job?.status === "failed") return null;

  const progress = job?.progress || 0;

  return (
    <div className="mb-12 flex flex-col items-center gap-4">
      {/* Simple spinner */}
      <Loader2 className="text-primary h-8 w-8 animate-spin" />

      {/* Progress Bar */}
      <div className="w-full max-w-md">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-center text-sm font-medium text-muted-foreground">
          {progress}%
        </p>
      </div>

      {/* Status Message */}
      {job?.message && (
        <p className="text-muted-foreground">{job.message}</p>
      )}
    </div>
  );
}
