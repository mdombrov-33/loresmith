"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const R2_MUSIC_URL = process.env.NEXT_PUBLIC_R2_MUSIC_URL;

interface Track {
  url: string;
  duration: number;
  name: string;
}

const themePlaylists: Record<string, Track[]> = {
  "norse-mythology": [
    {
      url: `${R2_MUSIC_URL}/norse-mythology/ambient_norse01.mp3`,
      duration: 410,
      name: "Echoes of Valhalla",
    },
    {
      url: `${R2_MUSIC_URL}/norse-mythology/ambient_norse02.mp3`,
      duration: 357,
      name: "Winds Over Yggdrasil",
    },
    {
      url: `${R2_MUSIC_URL}/norse-mythology/ambient_norse03.mp3`,
      duration: 159,
      name: "The Raven's Call",
    },
  ],
  fantasy: [
    {
      url: `${R2_MUSIC_URL}/fantasy/ambient_fantasy01.mp3`,
      duration: 254,
      name: "Whispers of the Enchanted",
    },
    {
      url: `${R2_MUSIC_URL}/fantasy/ambient_fantasy02.mp3`,
      duration: 479,
      name: "Through the Misty Vale",
    },
  ],
  cyberpunk: [
    {
      url: `${R2_MUSIC_URL}/cyberpunk/ambient_cyberpunk01.mp3`,
      duration: 244,
      name: "Digital Rain",
    },
    {
      url: `${R2_MUSIC_URL}/cyberpunk/ambient_cyberpunk02.mp3`,
      duration: 193,
      name: "Chrome Horizons",
    },
    {
      url: `${R2_MUSIC_URL}/cyberpunk/ambient_cyberpunk03.mp3`,
      duration: 118,
      name: "In the Neon, I Feel You Breathing",
    },
  ],
  "post-apocalyptic": [
    {
      url: `${R2_MUSIC_URL}/post-apocalyptic/ambient_post-apocalyptic01.mp3`,
      duration: 214,
      name: "Dust and Silence",
    },
    {
      url: `${R2_MUSIC_URL}/post-apocalyptic/ambient_post-apocalyptic02.mp3`,
      duration: 263,
      name: "Remnants of Tomorrow",
    },
  ],
  steampunk: [
    {
      url: `${R2_MUSIC_URL}/steampunk/ambient_steampunk01.mp3`,
      duration: 219,
      name: "Clockwork Dreams",
    },
    {
      url: `${R2_MUSIC_URL}/steampunk/ambient_steampunk02.mp3`,
      duration: 145,
      name: "Gears & Aether",
    },
    {
      url: `${R2_MUSIC_URL}/steampunk/ambient_steampunk03.mp3`,
      duration: 218,
      name: "The Brass Observatory",
    },
    {
      url: `${R2_MUSIC_URL}/steampunk/ambient_steampunk04.mp3`,
      duration: 190,
      name: "Steam & Starlight",
    },
  ],
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export function AudioToggle() {
  const { theme: visualTheme } = useTheme();
  const pathname = usePathname();
  const [initialAudioTheme, setInitialAudioTheme] = useState<string | null>(
    null,
  );
  const hasEnteredHubRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([0.5]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeRef = useRef(volume[0]);
  const wasPlayingBeforeSeekRef = useRef(false);

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

  const currentTrack = playlist[currentTrackIndex];

  // Handle theme changes
  useEffect(() => {
    if (!audioRef.current || playlist.length === 0) return;

    const isThemeChange =
      prevEffectiveAudioThemeRef.current !== effectiveAudioTheme;
    prevEffectiveAudioThemeRef.current = effectiveAudioTheme;

    if (isThemeChange) {
      setCurrentTrackIndex(0);
      const audio = audioRef.current;
      audio.src = playlist[0].url;
      audio.currentTime = 0;

      if (isPlaying) {
        audio.play().catch(() => {});
      }
    }
  }, [effectiveAudioTheme, playlist, isPlaying]);

  // Load track when index changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    const audio = audioRef.current;
    const wasPlaying = !audio.paused;

    audio.src = currentTrack.url;
    audio.currentTime = 0;

    if (wasPlaying) {
      audio.play().catch(() => {});
    }
  }, [currentTrackIndex, currentTrack]);

  // Handle track ended
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      // Move to next track, or loop to start
      setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [playlist.length]);

  // Update current time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!isSeeking) {
        setCurrentTime(audio.currentTime);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
  }, [isSeeking]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0];
    }
    volumeRef.current = volume[0];
  }, [volume]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const skipNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
  };

  const skipPrevious = () => {
    setCurrentTrackIndex(
      (prev) => (prev - 1 + playlist.length) % playlist.length,
    );
  };

  const handleSeekStart = () => {
    if (!audioRef.current) return;
    wasPlayingBeforeSeekRef.current = isPlaying;
    if (isPlaying) {
      audioRef.current.pause();
    }
    setIsSeeking(true);
  };

  const handleSeekChange = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const handleSeekEnd = (value: number[]) => {
    if (audioRef.current && currentTrack) {
      audioRef.current.currentTime = value[0];
      if (wasPlayingBeforeSeekRef.current) {
        audioRef.current.play().catch(() => {});
      }
      setIsSeeking(false);
    }
  };

  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index);
  };

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Music className={cn("h-4 w-4", isPlaying && "text-primary")} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            {/* Header */}
            <div>
              <h4 className="text-sm font-semibold">Now Playing</h4>
              <p className="text-muted-foreground text-xs capitalize">
                {effectiveAudioTheme.replace("-", " ")} Theme
              </p>
            </div>

            {/* Current Track Info */}
            {currentTrack && (
              <div className="space-y-2">
                <p className="text-sm font-medium">{currentTrack.name}</p>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <Slider
                    value={[currentTime]}
                    onPointerDown={handleSeekStart}
                    onValueChange={handleSeekChange}
                    onValueCommit={handleSeekEnd}
                    max={currentTrack.duration}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-muted-foreground flex justify-between text-xs">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(currentTrack.duration)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={skipPrevious}
                disabled={playlist.length === 0}
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                variant="default"
                size="icon"
                onClick={togglePlayPause}
                disabled={playlist.length === 0}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={skipNext}
                disabled={playlist.length === 0}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Volume2 className="text-muted-foreground h-4 w-4" />
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={1}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-muted-foreground w-10 text-right text-xs">
                  {Math.round(volume[0] * 100)}%
                </span>
              </div>
            </div>

            {/* Playlist */}
            <div className="space-y-2">
              <h5 className="text-muted-foreground text-xs font-semibold">
                Playlist
              </h5>
              <div className="[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 max-h-32 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full">
                {playlist.map((track, index) => (
                  <button
                    key={index}
                    onClick={() => selectTrack(index)}
                    className={cn(
                      "hover:bg-accent w-full rounded px-2 py-1.5 text-left text-xs transition-colors",
                      index === currentTrackIndex && "bg-accent font-medium",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{track.name}</span>
                      <span className="text-muted-foreground">
                        {formatTime(track.duration)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <audio ref={audioRef} />
    </>
  );
}
