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

  let level: "high" | "medium" | "low";
  let Icon: typeof CheckCircle;
  let colorClasses: string;

  if (num >= 80) {
    level = "high";
    Icon = CheckCircle;
    colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (num >= 50) {
    level = "medium";
    Icon = Info;
    colorClasses = "bg-amber-50 text-amber-700 border-amber-200";
  } else {
    level = "low";
    Icon = AlertTriangle;
    colorClasses = "bg-red-50 text-red-700 border-red-200";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        colorClasses,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {percentage}
      <span className="hidden sm:inline">
        {level === "high" && "High"}
        {level === "medium" && "Medium"}
        {level === "low" && "Low"}
      </span>
    </span>
  );
}
