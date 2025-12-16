import { useJobPolling } from "./jobs";

export function useGenerateWorldImage(
  onComplete?: (result: unknown) => void,
  onError?: (error: string) => void
) {
  const { submit, job, isPolling, isFailed, isCompleted } = useJobPolling(
    onComplete,
    onError
  );

  const generate = async (worldId: number) => {
    await submit({
      type: "generate_world_image",
      payload: {
        world_id: worldId,
      },
    });
  };

  return {
    generate,
    job,
    isGenerating: isPolling,
    isFailed,
    isCompleted,
  };
}
