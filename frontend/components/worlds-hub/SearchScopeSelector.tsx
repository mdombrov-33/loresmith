import ActionButton from "@/components/shared/ActionButton";

interface SearchScopeSelectorProps {
  selectedScope: "my" | "global";
  onScopeChange: (scope: "my" | "global") => void;
}

export default function SearchScopeSelector({
  selectedScope,
  onScopeChange,
}: SearchScopeSelectorProps) {
  return (
    <header className="mb-6">
      <div className="flex gap-2">
        <ActionButton
          variant={selectedScope === "my" ? "default" : "outline"}
          onClick={() => onScopeChange("my")}
        >
          My Worlds
        </ActionButton>
        <ActionButton
          variant={selectedScope === "global" ? "default" : "outline"}
          onClick={() => onScopeChange("global")}
        >
          Global Worlds
        </ActionButton>
      </div>
    </header>
  );
}
