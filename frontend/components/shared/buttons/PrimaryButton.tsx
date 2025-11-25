"use client";

import { ShimmerButton, ShimmerButtonProps } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";

/**
 * Primary CTA button with shimmer effect
 * Use for: Hero CTAs, Sign In, Start Adventure, primary actions
 */
export function PrimaryButton({
  children,
  className,
  background = "linear-gradient(135deg, oklch(0.65 0.20 290), oklch(0.55 0.18 290))",
  shimmerColor = "oklch(0.85 0.22 290)",
  ...props
}: ShimmerButtonProps) {
  return (
    <ShimmerButton
      background={background}
      shimmerColor={shimmerColor}
      className={cn("shadow-lg", className)}
      {...props}
    >
      {children}
    </ShimmerButton>
  );
}
