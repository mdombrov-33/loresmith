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
  isSelected = false,
  onClick,
}: FlipCardProps) {
  return (
    <div
      className={`group perspective-1000 h-full w-full cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="relative h-full w-full transform-style-3d transition-transform duration-700 group-hover:rotate-y-180">
        {/* Front Face */}
        <div className="backface-hidden absolute inset-0 h-full w-full">
          {frontContent}
        </div>

        {/* Back Face */}
        <div className="backface-hidden rotate-y-180 absolute inset-0 h-full w-full">
          {backContent}
        </div>
      </div>
    </div>
  );
}
