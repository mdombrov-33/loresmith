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
  background = "linear-gradient(135deg, var(--primary), oklch(from var(--primary) calc(l - 0.1) c h))",
  shimmerColor = "oklch(from var(--primary) calc(l + 0.2) c h)",
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
