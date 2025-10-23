"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAppStore } from "@/stores/appStore";
import { usePathname } from "next/navigation";

const RADIO_START_EPOCH = Date.UTC(2025, 9, 23, 0, 0, 0) / 1000; //* today's date as epoch

const themePlaylists: Record<string, { url: string; duration: number }[]> = {
  "norse-mythology": [
    { url: "/audio/norse-mythology/ambient_norse01.mp3", duration: 410 },
    { url: "/audio/norse-mythology/ambient_norse02.mp3", duration: 357 },
  ],
  fantasy: [
    { url: "/audio/fantasy/ambient_fantasy01.mp3", duration: 254 },
    { url: "/audio/fantasy/ambient_fantasy02.mp3", duration: 479 },
  ],
  // cyberpunk: [
  //   { url: "/audio/cyberpunk/cyber01.mp3", duration: 360 },
  // ],
};

export function AudioToggle() {
  const { theme, userChangedTheme, setUserChangedTheme } = useAppStore();
  const pathname = usePathname();
  const [initialTheme, setInitialTheme] = useState(theme);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([0.5]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fadeAudio = (targetVolume: number, duration: number = 500) => {
    return new Promise<void>((resolve) => {
      if (!audioRef.current) return resolve();

      const audio = audioRef.current;
      const startVolume = audio.volume;
      const startTime = Date.now();

      const fade = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        audio.volume = startVolume + (targetVolume - startVolume) * progress;

        if (progress < 1) {
          requestAnimationFrame(fade);
        } else {
          resolve();
        }
      };

      fade();
    });
  };
  const effectiveTheme = useMemo(() => {
    if (pathname.startsWith("/worlds/")) {
      const pathSegments = pathname.split("/");
      return pathSegments[2] || theme;
    } else if (pathname === "/search") {
      return initialTheme;
    } else {
      return theme;
    }
  }, [pathname, theme, initialTheme]);

  const prevEffectiveThemeRef = useRef(effectiveTheme);

  // Update initial theme when entering search
  useEffect(() => {
    if (pathname === "/search") {
      setInitialTheme(theme);
    }
  }, [pathname, theme]);

  const playlist = useMemo(
    () => themePlaylists[effectiveTheme] || [],
    [effectiveTheme],
  );
  const totalDuration = useMemo(
    () => playlist.reduce((sum, track) => sum + track.duration, 0),
    [playlist],
  );

  useEffect(() => {
    if (!audioRef.current) return;

    if (playlist.length === 0) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    const isThemeChange = prevEffectiveThemeRef.current !== effectiveTheme;
    prevEffectiveThemeRef.current = effectiveTheme;

    const switchAudio = async () => {
      const audio = audioRef.current!;

      // Fade out if playing and theme changed by user
      if (isPlaying && isThemeChange && userChangedTheme) {
        await fadeAudio(0, 500);
      }

      // Calculate position
      const now = Math.floor(Date.now() / 1000);
      const elapsed = (now - RADIO_START_EPOCH) % totalDuration;

      let cumulative = 0;
      let currentIndex = 0;
      let seekTime = 0;

      for (let i = 0; i < playlist.length; i++) {
        const track = playlist[i];
        if (elapsed < cumulative + track.duration) {
          currentIndex = i;
          seekTime = elapsed - cumulative;
          break;
        }
        cumulative += track.duration;
      }

      audio.src = playlist[currentIndex].url;
      audio.currentTime = seekTime;

      if (isPlaying) {
        if (isThemeChange && userChangedTheme) {
          await fadeAudio(volume[0], 500);
          setUserChangedTheme(false);
        }
        audio.play().catch(() => {});
      }
    };

    switchAudio();

    const handleEnded = () => {
      // When track ends, recalculate position in synced playlist
      const now = Math.floor(Date.now() / 1000);
      const elapsed = (now - RADIO_START_EPOCH) % totalDuration;

      let cumulative = 0;
      let currentIndex = 0;
      let seekTime = 0;

      for (let i = 0; i < playlist.length; i++) {
        const track = playlist[i];
        if (elapsed < cumulative + track.duration) {
          currentIndex = i;
          seekTime = elapsed - cumulative;
          break;
        }
        cumulative += track.duration;
      }

      const audio = audioRef.current!;
      audio.src = playlist[currentIndex].url;
      audio.currentTime = seekTime;
      if (isPlaying) {
        audio.play().catch(() => {});
      }
    };

    const audioElement = audioRef.current;
    audioElement.addEventListener("ended", handleEnded);

    return () => {
      audioElement.removeEventListener("ended", handleEnded);
    };
  }, [
    effectiveTheme,
    playlist,
    totalDuration,
    isPlaying,
    userChangedTheme,
    setUserChangedTheme,
  ]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0];
    }
  }, [volume]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={toggleAudio}>
        {isPlaying ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4" />
        )}
      </Button>
      {isPlaying && (
        <Slider
          value={volume}
          onValueChange={setVolume}
          max={1}
          step={0.1}
          className="w-20"
        />
      )}
      <audio ref={audioRef} />
    </div>
  );
}
