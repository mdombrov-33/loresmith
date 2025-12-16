import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { Job, JobRequest } from "@/lib/api/jobs";
import { API_BASE_URL, fetchWithTimeout, getAuthHeaders } from "@/lib/api/base";
import { useEffect, useRef } from "react";

/**
 * Hook to submit a new job
 */
export function useSubmitJob() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (request: JobRequest) => {
      const token = await getToken();
      const url = `${API_BASE_URL}/jobs`;
      const response = await fetchWithTimeout(url, {
        method: "POST",
        headers: await getAuthHeaders(token),
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        throw new Error(`Failed to submit job: ${response.statusText}`);
      }
      return await response.json();
    },
  });
}

/**
 * Hook to poll job status
 * Automatically refetches every 3 seconds while job is pending/processing
 */
export function useJobStatus(jobId: string | null, enabled: boolean = true) {
  const { getToken, isLoaded } = useAuth();

  return useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const token = await getToken();
      const url = `${API_BASE_URL}/jobs/${jobId}`;
      const response = await fetchWithTimeout(url, {
        method: "GET",
        headers: await getAuthHeaders(token),
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Job not found: ${jobId}`);
        }
        throw new Error(`Failed to get job status: ${response.statusText}`);
      }
      return await response.json();
    },
    enabled: !!jobId && enabled && !!isLoaded,
    refetchInterval: (query) => {
      const data = query.state.data as Job | undefined;
      //* Stop polling if job is completed or failed
      if (!data || data.status === "completed" || data.status === "failed") {
        return false;
      }
      //* Poll every 3 seconds while pending/processing
      return 3000;
    },
    retry: false,
  });
}

/**
 * Hook for job lifecycle - submit job and poll until completion
 */
export function useJobPolling(
  onComplete?: (result: unknown) => void,
  onError?: (error: string) => void,
) {
  const { mutateAsync: submit } = useSubmitJob();
  const queryClient = useQueryClient();
  const jobIdRef = useRef<string | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);
  const errorReportedRef = useRef(false);
  const hasFatalErrorRef = useRef(false); //* Track if job has failed permanently

  //* Update refs to avoid stale closures
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  }, [onComplete, onError]);

  const shouldPoll: boolean = !!(jobIdRef.current && !hasFatalErrorRef.current);
  const {
    data: job,
    error: queryError,
    isError,
  } = useJobStatus(jobIdRef.current, shouldPoll);

  //* Handle job completion/failure
  useEffect(() => {
    if (!job && !isError) return;

    if (job?.status === "completed") {
      onCompleteRef.current?.(job.result);
      errorReportedRef.current = false;
      hasFatalErrorRef.current = false;
      //* Clean up job from cache after 5 seconds
      setTimeout(() => {
        queryClient.removeQueries({ queryKey: ["job", job.id] });
      }, 5000);
    }

    if (job?.status === "failed") {
      onErrorRef.current?.(job.error || "Job failed");
      errorReportedRef.current = true;
      hasFatalErrorRef.current = true; //* Mark as fatal - don't resume
    }

    //* Handle network/query errors (backend down, job not found, etc.)
    if (isError && jobIdRef.current && !errorReportedRef.current) {
      const errorMessage =
        queryError instanceof Error
          ? queryError.message
          : "Failed to connect to server. Please check your connection and try again.";
      onErrorRef.current?.(errorMessage);
      errorReportedRef.current = true;
      hasFatalErrorRef.current = true; //* Mark as fatal - don't resume even if backend comes back
    }
  }, [job, queryError, isError, queryClient]);

  const submitAndPoll = async (request: JobRequest) => {
    errorReportedRef.current = false;
    hasFatalErrorRef.current = false; // Reset fatal error flag for new job

    //* Clean up old job from cache before submitting new one
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
    isPolling:
      !hasFatalErrorRef.current &&
      (job?.status === "pending" || job?.status === "processing"),
    isCompleted: job?.status === "completed",
    isFailed: job?.status === "failed" || hasFatalErrorRef.current,
  };
}
