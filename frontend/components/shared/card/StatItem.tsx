import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LucideIcon } from "lucide-react";

interface StatItemProps {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  value: string | number;
  valueColor?: string;
  tooltip: string;
}

export default function StatItem({
  icon: Icon,
  iconColor,
  label,
  value,
  valueColor = "text-foreground",
  tooltip,
}: StatItemProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex cursor-help items-center gap-1">
            <Icon className={`h-3 w-3 ${iconColor}`} />
            <div className="text-muted-foreground text-xs">{label}</div>
            <div className={`text-sm font-semibold ${valueColor}`}>
              {value}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
