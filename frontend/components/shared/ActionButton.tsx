import { Button } from "@/components/ui/button";

interface ActionButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  children?: React.ReactNode;
  className?: string;
}

export default function ActionButton({
  variant = "default",
  size = "default",
  icon,
  disabled = false,
  onClick,
  type = "button",
  children,
  className,
}: ActionButtonProps) {
  const buttonContent = (
    <>
      {icon}
      {children}
    </>
  );

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      type={type}
      onClick={onClick}
      className={`gap-2 ${className || ""}`}
    >
      {buttonContent}
    </Button>
  );
}
