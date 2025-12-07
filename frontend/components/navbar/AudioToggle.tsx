"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Volume2, VolumeX } from "lucide-react";
import ActionButton from "@/components/shared/buttons/ActionButton";
import { Slider } from "@/components/ui/slider";
import { useAppStore } from "@/stores/appStore";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

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
    {
      url: `${R2_MUSIC_URL}/norse-mythology/ambient_norse03.mp3`,
      duration: 159,
    },
  ],
  fantasy: [
    { url: `${R2_MUSIC_URL}/fantasy/ambient_fantasy01.mp3`, duration: 254 },
    { url: `${R2_MUSIC_URL}/fantasy/ambient_fantasy02.mp3`, duration: 479 },
  ],
  cyberpunk: [
    { url: `${R2_MUSIC_URL}/cyberpunk/ambient_cyberpunk01.mp3`, duration: 244 },
    { url: `${R2_MUSIC_URL}/cyberpunk/ambient_cyberpunk02.mp3`, duration: 193 },
    { url: `${R2_MUSIC_URL}/cyberpunk/ambient_cyberpunk03.mp3`, duration: 118 },
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
    { url: `${R2_MUSIC_URL}/steampunk/ambient_steampunk03.mp3`, duration: 218 },
    { url: `${R2_MUSIC_URL}/steampunk/ambient_steampunk04.mp3`, duration: 190 },
  ],
};

export function AudioToggle() {
  const { theme: visualTheme } = useTheme();
  const { userChangedTheme, setUserChangedTheme } = useAppStore();
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

        if (progress < 1) requestAnimationFrame(fade);
        else resolve();
      };

      fade();
    });
  };

  const effectiveAudioTheme = useMemo(() => {
    const isHubPage = pathname === "/my-worlds" || pathname === "/discover";
    if (isHubPage) {
      return initialAudioTheme || visualTheme || "fantasy";
    } else {
      return visualTheme || "fantasy";
    }
  }, [pathname, visualTheme, initialAudioTheme]);

  const prevEffectiveAudioThemeRef = useRef(effectiveAudioTheme);

  useEffect(() => {
    const isHubPage = pathname === "/my-worlds" || pathname === "/discover";
    if (isHubPage && !hasEnteredHubRef.current) {
      hasEnteredHubRef.current = true;
      setInitialAudioTheme(visualTheme || "fantasy");
    } else if (!isHubPage) {
      hasEnteredHubRef.current = false;
      setInitialAudioTheme(null);
    }
  }, [pathname, visualTheme]);

  const playlist = useMemo(
    () => themePlaylists[effectiveAudioTheme] || [],
    [effectiveAudioTheme],
  );
  const totalDuration = useMemo(
    () => playlist.reduce((sum, track) => sum + track.duration, 0),
    [playlist],
  );

  // Helper to calculate current track
  const getCurrentTrack = () => {
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

    return { currentIndex, seekTime };
  };

  useEffect(() => {
    if (!audioRef.current || playlist.length === 0) return;

    const isThemeChange =
      prevEffectiveAudioThemeRef.current !== effectiveAudioTheme;
    prevEffectiveAudioThemeRef.current = effectiveAudioTheme;

    const switchAudio = async () => {
      const audio = audioRef.current!;
      if (isPlaying && isThemeChange) {
        await fadeAudio(0, 500);
      }

      const { currentIndex, seekTime } = getCurrentTrack();
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

    const handleEnded = async () => {
      if (!audioRef.current) return;

      const delayBetweenTracks = 500; // 500ms delay between tracks
      await fadeAudio(0, 200); // fade out

      setTimeout(async () => {
        const { currentIndex, seekTime } = getCurrentTrack();
        const audio = audioRef.current!;
        audio.src = playlist[currentIndex].url;
        audio.currentTime = seekTime;

        if (isPlaying) {
          audio.play().catch(() => {});
          await fadeAudio(volumeRef.current, 200); // fade in
        }
      }, delayBetweenTracks);
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
      />
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
