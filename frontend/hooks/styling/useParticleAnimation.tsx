"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";
import { loadStarsPreset } from "tsparticles-preset-stars";
import { loadSnowPreset } from "tsparticles-preset-snow";
import { loadFirePreset } from "tsparticles-preset-fire";
import { loadLinksPreset } from "tsparticles-preset-links";
import { loadFireflyPreset } from "tsparticles-preset-firefly";
import type { Engine } from "tsparticles-engine";

interface UseParticleAnimationProps {
  theme: string;
}

export function useParticleAnimation({ theme }: UseParticleAnimationProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(theme);

  useEffect(() => {
    if (theme !== currentTheme) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setCurrentTheme(theme);
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [theme, currentTheme]);
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
    await loadStarsPreset(engine);
    await loadSnowPreset(engine);
    await loadFirePreset(engine);
    await loadLinksPreset(engine);
    await loadFireflyPreset(engine);
  }, []);

  const particlesOptions = useMemo(() => {
    const t = currentTheme;
    switch (t) {
      case "fantasy":
        return {
          preset: "stars",
          particles: {
            color: { value: "#ffd700" },
            number: { value: 30 },
          },
          background: { color: { value: "transparent" } },
          fullScreen: { enable: false },
        };
      case "norse-mythology":
        return {
          preset: "snow",
          particles: {
            color: { value: "#ffffff" },
            number: { value: 40 },
          },
          background: { color: { value: "transparent" } },
          fullScreen: { enable: false },
        };
      case "steampunk":
        return {
          preset: "firefly",
          particles: {
            color: { value: "#ff4500" },
            number: { value: 5 },
          },
          background: { color: { value: "transparent" } },
          fullScreen: { enable: false },
        };
      case "cyberpunk":
        return {
          preset: "links",
          particles: {
            color: { value: "#00ff00" },
            links: {
              enable: true,
              color: "#00ff00",
              distance: 150,
              opacity: 0.4,
              width: 1,
            },
            number: { value: 35 },
          },
          background: { color: { value: "transparent" } },
          fullScreen: { enable: false },
        };
      case "post-apocalyptic":
        return {
          preset: "snow",
          particles: {
            color: { value: "#8b3a3a" },
            number: { value: 120 },
            opacity: {
              value: 0.6,
              random: true,
            },
            size: {
              value: 4,
              random: true,
            },
            move: {
              direction: "bottom-right",
              speed: 1.2,
              straight: false,
              random: true,
            },
          },
          background: { color: { value: "transparent" } },
          fullScreen: { enable: false },
        };
      default:
        return {
          preset: "stars",
          background: { color: { value: "transparent" } },
          fullScreen: { enable: false },
        };
    }
  }, [currentTheme]);

  const ParticlesComponent = useMemo(
    () => (
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
        className={`pointer-events-none h-full w-full transition-opacity duration-300 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      />
    ),
    [particlesInit, particlesOptions, isTransitioning],
  );

  return ParticlesComponent;
}
