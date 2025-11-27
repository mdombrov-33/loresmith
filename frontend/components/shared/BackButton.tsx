"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ActionButton from "./buttons/ActionButton";

interface BackButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  href?: string; // Optional path to navigate to instead of using router.back()
}

export default function BackButton({
  variant = "ghost",
  size = "sm",
  className = "",
  href,
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <ActionButton
      variant={variant}
      size={size}
      onClick={handleBack}
      icon={<ArrowLeft className="h-4 w-4" />}
      className={className}
    >
      Back
    </ActionButton>
  );
}
