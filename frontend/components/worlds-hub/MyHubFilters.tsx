import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MyHubFiltersProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  worldCount: number;
}

export default function MyHubFilters({
  selectedStatus,
  onStatusChange,
  worldCount,
}: MyHubFiltersProps) {
  return (
    <div className="flex items-center gap-4">
      <Select
        value={selectedStatus || "all"}
        onValueChange={(val) => onStatusChange(val === "all" ? "" : val)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-muted-foreground text-sm">
        {worldCount} {worldCount === 1 ? "world" : "worlds"}
      </p>
    </div>
  );
}
