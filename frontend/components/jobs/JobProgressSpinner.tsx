"use client";

import { Job } from "@/lib/api/jobs";
import { Sparkles } from "lucide-react";

interface JobProgressSpinnerProps {
  job: Job | undefined;
  className?: string;
  showProgress?: boolean;
  showMessage?: boolean;
}

export default function JobProgressSpinner({
  job,
  className = "",
  showProgress = true,
  showMessage = true,
}: JobProgressSpinnerProps) {
  const progress = job?.progress || 0;

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      {/* Fancy Animated Spinner */}
      <div className="relative">
        <div className="border-primary/20 border-t-primary h-24 w-24 animate-spin rounded-full border-4"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="text-primary h-8 w-8" />
        </div>
      </div>

      {/* Progress Bar */}
      {showProgress && (
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
      )}

      {/* Status Message */}
      {showMessage && job?.message && (
        <p className="text-muted-foreground">{job.message}</p>
      )}

      {/* Error Display */}
      {job?.status === "failed" && job.error && (
        <div className="max-w-md rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">Error:</p>
          <p className="mt-1 text-sm text-muted-foreground">{job.error}</p>
        </div>
      )}
    </div>
  );
}
