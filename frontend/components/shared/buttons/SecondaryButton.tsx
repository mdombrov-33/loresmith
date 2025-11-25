"use client";

import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { cn } from "@/lib/utils";

interface SecondaryButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  containerClassName?: string;
  as?: React.ElementType;
  duration?: number;
  clockwise?: boolean;
}

/**
 * Secondary button with animated border gradient
 * Use for: Important secondary actions, Create World, Join Game
 */
export function SecondaryButton({
  children,
  className,
  containerClassName,
  ...props
}: SecondaryButtonProps) {
  return (
    <HoverBorderGradient
      containerClassName={cn("rounded-lg", containerClassName)}
      className={cn("bg-card text-foreground px-6 py-2.5 font-medium", className)}
      {...props}
    >
      {children}
    </HoverBorderGradient>
  );
}
