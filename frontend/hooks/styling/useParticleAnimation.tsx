"use client";

import { useCallback, useMemo } from "react";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";
import { loadStarsPreset } from "tsparticles-preset-stars";
import { loadSnowPreset } from "tsparticles-preset-snow";
import { loadFirePreset } from "tsparticles-preset-fire";
import { loadLinksPreset } from "tsparticles-preset-links";
import type { Engine } from "tsparticles-engine";

interface UseParticleAnimationProps {
  theme: string;
}

export function useParticleAnimation({ theme }: UseParticleAnimationProps) {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
    await loadStarsPreset(engine);
    await loadSnowPreset(engine);
    await loadFirePreset(engine);
    await loadLinksPreset(engine);
  }, []);

  const particlesOptions = useMemo(() => {
    switch (theme) {
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
          preset: "fire",
          particles: {
            color: { value: "#ff4500" },
            number: { value: 25 },
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
          preset: "fire",
          particles: {
            color: { value: "#8b0000" },
            number: { value: 20 },
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
  }, [theme]);

  const ParticlesComponent = useMemo(
    () => (
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
        className="pointer-events-none h-full w-full"
      />
    ),
    [particlesInit, particlesOptions],
  );

  return ParticlesComponent;
}
