import { cn } from "@/lib/utils";
import type { RiskCategory } from "@/lib/types";

interface RiskBadgeProps {
  category: RiskCategory;
  size?: "sm" | "md" | "lg" | "xl";
}

const CONFIG: Record<RiskCategory, { className: string }> = {
  "Low Risk":    { className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  "Medium Risk": { className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  "High Risk":   { className: "bg-red-500/15 text-red-400 border-red-500/30" },
};

export function RiskBadge({ category, size = "md" }: RiskBadgeProps) {
  const { className } = CONFIG[category];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold whitespace-nowrap",
        className,
        size === "sm" && "px-2.5 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        size === "lg" && "px-4 py-1.5 text-base",
        size === "xl" && "px-5 py-2 text-lg"
      )}
    >
      {category}
    </span>
  );
}
