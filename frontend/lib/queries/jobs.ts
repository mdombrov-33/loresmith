import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { submitJob, getJobStatus, Job, JobRequest } from "@/lib/api/jobs";
import { useEffect, useRef } from "react";

/**
 * Hook to submit a new job
 */
export function useSubmitJob() {
  return useMutation({
    mutationFn: (request: JobRequest) => submitJob(request),
  });
}

/**
 * Hook to poll job status
 * Automatically refetches every 3 seconds while job is pending/processing
 */
export function useJobStatus(jobId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: () => getJobStatus(jobId!),
    enabled: !!jobId && enabled,
    refetchInterval: (query) => {
      const data = query.state.data as Job | undefined;
      // Stop polling if job is completed or failed
      if (!data || data.status === "completed" || data.status === "failed") {
        return false;
      }
      // Poll every 3 seconds while pending/processing
      return 3000;
    },
    retry: false,
  });
}

/**
 * Hook for job lifecycle - submit job and poll until completion
 */
export function useJobPolling(onComplete?: (result: any) => void, onError?: (error: string) => void) {
  const { mutateAsync: submit } = useSubmitJob();
  const queryClient = useQueryClient();
  const jobIdRef = useRef<string | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);
  const errorReportedRef = useRef(false);
  const hasFatalErrorRef = useRef(false); // Track if job has failed permanently

  // Update refs to avoid stale closures
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  }, [onComplete, onError]);

  // Disable polling if we've had a fatal error
  const shouldPoll = jobIdRef.current && !hasFatalErrorRef.current;
  const { data: job, error: queryError, isError } = useJobStatus(
    jobIdRef.current,
    shouldPoll
  );

  // Handle job completion/failure
  useEffect(() => {
    if (!job && !isError) return;

    if (job?.status === "completed") {
      onCompleteRef.current?.(job.result);
      errorReportedRef.current = false;
      hasFatalErrorRef.current = false;
      // Clean up job from cache after 5 seconds
      setTimeout(() => {
        queryClient.removeQueries({ queryKey: ["job", job.id] });
      }, 5000);
    }

    if (job?.status === "failed") {
      onErrorRef.current?.(job.error || "Job failed");
      errorReportedRef.current = true;
      hasFatalErrorRef.current = true; // Mark as fatal - don't resume
    }

    // Handle network/query errors (backend down, job not found, etc.)
    if (isError && jobIdRef.current && !errorReportedRef.current) {
      const errorMessage = queryError instanceof Error
        ? queryError.message
        : "Failed to connect to server. Please check your connection and try again.";
      onErrorRef.current?.(errorMessage);
      errorReportedRef.current = true;
      hasFatalErrorRef.current = true; // Mark as fatal - don't resume even if backend comes back
    }
  }, [job, queryError, isError, queryClient]);

  const submitAndPoll = async (request: JobRequest) => {
    errorReportedRef.current = false;
    hasFatalErrorRef.current = false; // Reset fatal error flag for new job

    // Clean up old job from cache before submitting new one
    if (jobIdRef.current) {
      queryClient.removeQueries({ queryKey: ["job", jobIdRef.current] });
    }

    const newJob = await submit(request);
    jobIdRef.current = newJob.id;
    return newJob;
  };

  return {
    submit: submitAndPoll,
    job,
    isPolling: !hasFatalErrorRef.current && (job?.status === "pending" || job?.status === "processing"),
    isCompleted: job?.status === "completed",
    isFailed: job?.status === "failed" || hasFatalErrorRef.current,
  };
}
