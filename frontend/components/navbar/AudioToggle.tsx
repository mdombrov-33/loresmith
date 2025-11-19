"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Volume2, VolumeX } from "lucide-react";
import ActionButton from "@/components/shared/ActionButton";
import { Slider } from "@/components/ui/slider";
import { useAppStore } from "@/stores/appStore";
import { usePathname } from "next/navigation";

const RADIO_START_EPOCH = Date.UTC(2025, 9, 23, 0, 0, 0) / 1000; //* today's date as epoch
const R2_MUSIC_URL = process.env.NEXT_PUBLIC_R2_MUSIC_URL;

const themePlaylists: Record<string, { url: string; duration: number }[]> = {
  "norse-mythology": [
    {
      url: `${R2_MUSIC_URL}/norse-mythology/ambient_norse01.mp3`,
      duration: 410,
    },
    {
      url: `${R2_MUSIC_URL}/norse-mythology/ambient_norse02.mp3`,
      duration: 357,
    },
  ],
  fantasy: [
    { url: `${R2_MUSIC_URL}/fantasy/ambient_fantasy01.mp3`, duration: 254 },
    { url: `${R2_MUSIC_URL}/fantasy/ambient_fantasy02.mp3`, duration: 479 },
  ],
  cyberpunk: [
    { url: `${R2_MUSIC_URL}/cyberpunk/ambient_cyberpunk01.mp3`, duration: 244 },
    { url: `${R2_MUSIC_URL}/cyberpunk/ambient_cyberpunk02.mp3`, duration: 193 },
  ],
  "post-apocalyptic": [
    {
      url: `${R2_MUSIC_URL}/post-apocalyptic/ambient_post-apocalyptic01.mp3`,
      duration: 214,
    },
    {
      url: `${R2_MUSIC_URL}/post-apocalyptic/ambient_post-apocalyptic02.mp3`,
      duration: 263,
    },
  ],
  steampunk: [
    { url: `${R2_MUSIC_URL}/steampunk/ambient_steampunk01.mp3`, duration: 219 },
    { url: `${R2_MUSIC_URL}/steampunk/ambient_steampunk02.mp3`, duration: 145 },
  ],
};

export function AudioToggle() {
  const {
    theme,
    audioTheme,
    setAudioTheme,
    userChangedTheme,
    setUserChangedTheme,
  } = useAppStore();
  const pathname = usePathname();
  const [initialAudioTheme, setInitialAudioTheme] = useState<string | null>(
    null,
  );
  const hasEnteredHubRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([0.5]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef(volume[0]);

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
  // Use visual theme for world pages, otherwise use audioTheme
  const effectiveAudioTheme = useMemo(() => {
    if (pathname.startsWith("/worlds/")) {
      // Extract theme from URL path
      const pathSegments = pathname.split("/");
      return pathSegments[2] || audioTheme;
    } else if (pathname.startsWith("/adventure/")) {
      // For adventure pages, use the current theme (should be set by the page)
      return theme;
    } else if (pathname === "/worlds-hub") {
      // Keep the theme from when they entered the hub
      return initialAudioTheme || audioTheme;
    } else {
      // Home or other pages - use current audioTheme
      return audioTheme;
    }
  }, [pathname, theme, audioTheme, initialAudioTheme]);

  const prevEffectiveAudioThemeRef = useRef(effectiveAudioTheme);

  useEffect(() => {
    if (pathname === "/worlds-hub" && !hasEnteredHubRef.current) {
      hasEnteredHubRef.current = true;
      setInitialAudioTheme(audioTheme);
    } else if (pathname !== "/worlds-hub") {
      hasEnteredHubRef.current = false;
      setInitialAudioTheme(null);
    }
  }, [pathname, audioTheme]);

  // Sync audioTheme when not on hub
  useEffect(() => {
    if (pathname !== "/worlds-hub") {
      setAudioTheme(effectiveAudioTheme);
    }
  }, [effectiveAudioTheme, pathname, setAudioTheme]);

  const playlist = useMemo(
    () => themePlaylists[effectiveAudioTheme] || [],
    [effectiveAudioTheme],
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

    const isThemeChange =
      prevEffectiveAudioThemeRef.current !== effectiveAudioTheme;
    prevEffectiveAudioThemeRef.current = effectiveAudioTheme;

    const switchAudio = async () => {
      const audio = audioRef.current!;

      if (isPlaying && isThemeChange) {
        await fadeAudio(0, 500);
      }

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
        if (isThemeChange) {
          await fadeAudio(volumeRef.current, 500);
          setUserChangedTheme(false);
        }
        audio.play().catch(() => {});
      }
    };

    switchAudio();

    const handleEnded = () => {
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
    effectiveAudioTheme,
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
    volumeRef.current = volume[0];
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
      <ActionButton
        variant="ghost"
        size="sm"
        onClick={toggleAudio}
        icon={
          isPlaying ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )
        }
      ></ActionButton>
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
