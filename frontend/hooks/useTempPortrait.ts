import { useState, useEffect } from "react";

/**
 * Hook to poll for a temporary portrait by UUID.
 * Returns the base64 portrait string when ready, or null while pending.
 */
export function useTempPortrait(uuid: string | null | undefined): string | null {
  const [portraitBase64, setPortraitBase64] = useState<string | null>(null);

  useEffect(() => {
    if (!uuid) return;

    let isCancelled = false;

    const pollForPortrait = async () => {
      try {
        const response = await fetch(`http://localhost:8080/temp-portraits/${uuid}`);

        if (response.ok) {
          const data = await response.json();
          if (data.ready && data.portrait) {
            if (!isCancelled) {
              setPortraitBase64(data.portrait);
            }
          }
        }
        // If not ready yet, keep polling
      } catch (error) {
        console.error("Error polling for portrait:", error);
      }
    };

    // Initial poll
    pollForPortrait();

    // Poll every 3 seconds until portrait is ready
    const interval = setInterval(() => {
      if (!portraitBase64) {
        pollForPortrait();
      } else {
        clearInterval(interval);
      }
    }, 3000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [uuid, portraitBase64]);

  return portraitBase64;
}
