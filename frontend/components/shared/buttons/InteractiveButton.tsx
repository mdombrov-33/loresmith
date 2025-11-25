"use client";

import { RippleButton } from "@/components/ui/ripple-button";
import { cn } from "@/lib/utils";

interface InteractiveButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  children: React.ReactNode;
  rippleColor?: string;
}

/**
 * Interactive button with ripple effect
 * Use for: Standard actions with nice feedback, form submits, confirmations
 */
export function InteractiveButton({
  children,
  className,
  rippleColor = "oklch(0.65 0.20 290)",
  ...props
}: InteractiveButtonProps) {
  return (
    <RippleButton
      rippleColor={rippleColor}
      className={cn(
        "bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-lg font-medium transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </RippleButton>
  );
}
