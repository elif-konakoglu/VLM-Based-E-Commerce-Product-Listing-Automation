import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface ConfidenceBadgeProps {
  percentage: string;
  className?: string;
}

function parsePercentage(value: string): number {
  const num = parseInt(value.replace("%", ""), 10);
  return isNaN(num) ? 0 : num;
}

export default function ConfidenceBadge({ percentage, className }: ConfidenceBadgeProps) {
  const num = parsePercentage(percentage);

  let Icon: typeof CheckCircle;
  let colorClasses: string;

  if (num >= 80) {
    Icon = CheckCircle;
    colorClasses = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  } else if (num >= 50) {
    Icon = Info;
    colorClasses = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  } else {
    Icon = AlertTriangle;
    colorClasses = "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-semibold",
        colorClasses,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {percentage}
    </span>
  );
}
