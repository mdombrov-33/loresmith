"use client";

import { ReactNode } from "react";

interface StaggeredRevealProps {
  children: ReactNode;
  index: number;
  className?: string;
}

export default function StaggeredReveal({
  children,
  index,
  className = "",
}: StaggeredRevealProps) {
  const delays = ["animate-reveal-delay-0", "animate-reveal-delay-150", "animate-reveal-delay-300"];
  const delayClass = delays[index % delays.length];

  return (
    <div className={`animate-reveal-card ${delayClass} ${className}`}>
      {children}
    </div>
  );
}
