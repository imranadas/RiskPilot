import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type IndicatorType = "positive" | "negative" | "risk";

interface IndicatorListProps {
  type: IndicatorType;
  items: string[];
}

type IndicatorConfig = {
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  label: string;
};

const CONFIG: Record<IndicatorType, IndicatorConfig> = {
  positive: {
    icon: CheckCircle2,
    iconClass: "text-emerald-400",
    label: "Positive Indicators",
  },
  negative: {
    icon: XCircle,
    iconClass: "text-red-400",
    label: "Negative Indicators",
  },
  risk: {
    icon: AlertTriangle,
    iconClass: "text-amber-400",
    label: "Risk Factors",
  },
};

export function IndicatorList({ type, items }: IndicatorListProps) {
  const { icon: Icon, iconClass, label } = CONFIG[type];

  if (!items?.length) return null;

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconClass)} />
            <span className="leading-snug">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
