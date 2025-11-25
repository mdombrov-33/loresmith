"use client";

import { Button } from "@/components/ui/moving-border";
import { cn } from "@/lib/utils";

interface SpecialButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  borderRadius?: string;
  duration?: number;
}

/**
 * Special button with moving border animation
 * Use for: Premium features, special events, highlighted actions
 */
export function SpecialButton({
  children,
  className,
  borderRadius = "0.75rem",
  duration = 3000,
  ...props
}: SpecialButtonProps) {
  return (
    <Button
      borderRadius={borderRadius}
      duration={duration}
      className={cn(
        "bg-card text-foreground border-border px-6 py-2.5 font-medium",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
