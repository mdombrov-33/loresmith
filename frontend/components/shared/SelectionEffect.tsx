"use client";

import { useEffect, useState } from "react";

interface SelectionEffectProps {
  isActive: boolean;
}

export default function SelectionEffect({ isActive }: SelectionEffectProps) {
  const [particles, setParticles] = useState<number[]>([]);

  useEffect(() => {
    if (isActive) {
      // Generate 12 particles
      setParticles(Array.from({ length: 12 }, (_, i) => i));

      // Clear particles after animation completes
      const timeout = setTimeout(() => {
        setParticles([]);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [isActive]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((i) => (
        <div
          key={i}
          className="bg-primary absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
          style={{
            animation: `particle-burst 1s ease-out forwards`,
            transform: `rotate(${i * 30}deg)`,
          }}
        />
      ))}
    </div>
  );
}
