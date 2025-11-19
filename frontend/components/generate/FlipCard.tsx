"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

interface FlipCardProps {
  frontContent: ReactNode;
  backContent: ReactNode;
  className?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function FlipCard({
  frontContent,
  backContent,
  className = "",
  isSelected,
  onClick,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={cn(
        "group relative h-full w-full cursor-pointer",
        "[perspective:2000px]",
        className
      )}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={onClick}
    >
      <div
        className={cn(
          "relative h-full w-full",
          "[transform-style:preserve-3d]",
          "transition-all duration-700 ease-out",
          isFlipped
            ? "[transform:rotateY(180deg)]"
            : "[transform:rotateY(0deg)]"
        )}
      >
        {/* Front Face */}
        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            "[transform:rotateY(0deg)] [backface-visibility:hidden]",
            "transition-all duration-700",
            isFlipped ? "opacity-0" : "opacity-100"
          )}
        >
          {frontContent}
        </div>

        {/* Back Face */}
        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            "[transform:rotateY(180deg)] [backface-visibility:hidden]",
            "transition-all duration-700",
            !isFlipped ? "opacity-0" : "opacity-100"
          )}
        >
          {backContent}
        </div>
      </div>

      {/* Glow effect on selected cards */}
      {isSelected && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 rounded-xl",
            "bg-primary/20 blur-xl",
            "animate-pulse",
            "-z-10"
          )}
        />
      )}
    </div>
  );
}
