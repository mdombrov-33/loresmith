import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthInputProps {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  id?: string;
}

export function AuthInput({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  autoComplete,
  id: providedId,
}: AuthInputProps) {
  const generatedId = useId();
  const id = providedId || generatedId;

  return (
    <div className="[--ring:var(--color-primary)] space-y-2">
      <Label htmlFor={id} className="text-foreground text-sm font-medium">
        {label}
      </Label>
      <Input
        id={id}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 px-3"
        autoComplete={autoComplete}
      />
    </div>
  );
}
