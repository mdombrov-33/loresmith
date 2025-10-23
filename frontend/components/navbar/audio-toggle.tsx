"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAppStore } from "@/stores/appStore";

const RADIO_START_EPOCH = Date.UTC(2025, 9, 23, 0, 0, 0) / 1000; //* today's date as epoch

const themePlaylists: Record<string, { url: string; duration: number }[]> = {
  "norse-mythology": [
    { url: "/audio/norse-mythology/ambient_norse01.mp3", duration: 410 },
    { url: "/audio/norse-mythology/ambient_norse02.mp3", duration: 357 },
  ],
  //   fantasy: [{ url: "/audio/fantasy/fantasy01.mp3", duration: 360 }],
};

export function AudioToggle() {
  const { theme } = useAppStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([0.5]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playlist = useMemo(() => themePlaylists[theme] || [], [theme]);
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

    const audio = audioRef.current;
    audio.src = playlist[currentIndex].url;
    audio.currentTime = seekTime;

    if (isPlaying) {
      audio.play().catch(() => {});
    }

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

      audio.src = playlist[currentIndex].url;
      audio.currentTime = seekTime;
      if (isPlaying) {
        audio.play().catch(() => {});
      }
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [theme, playlist, totalDuration, isPlaying]);

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
