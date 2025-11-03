"use client";

import { ReactNode } from "react";

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
  onClick,
}: FlipCardProps) {
  return (
    <div
      className={`group perspective-1000 h-full w-full cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="transform-style-3d relative h-full w-full transition-transform duration-700 group-hover:rotate-y-180">
        {/* Front Face */}
        <div className="absolute inset-0 h-full w-full backface-hidden">
          {frontContent}
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 h-full w-full rotate-y-180 backface-hidden">
          {backContent}
        </div>
      </div>
    </div>
  );
}
