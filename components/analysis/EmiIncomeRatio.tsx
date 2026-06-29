import { cn, formatCurrency } from "@/lib/utils";

interface Props {
  emi: number | null;
  income: number | null;
}

export function EmiIncomeRatio({ emi, income }: Props) {
  if (!emi || !income) return null;

  const ratio = Math.min(100, Math.round((emi / income) * 100));
  const isGood = ratio <= 40;
  const isWarning = ratio > 40 && ratio <= 60;

  const barColor = isGood ? "bg-emerald-500" : isWarning ? "bg-amber-500" : "bg-red-500";
  const labelColor = isGood ? "text-emerald-400" : isWarning ? "text-amber-400" : "text-red-400";
  const statusText = isGood ? "Healthy" : isWarning ? "Stretched" : "Overextended";

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">EMI-to-Income Ratio</span>
        <span className={cn("font-semibold tabular-nums", labelColor)}>
          {ratio}% — {statusText}
        </span>
      </div>

      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-border">
        {/* Zone markers */}
        <div className="absolute inset-0 flex">
          <div className="h-full bg-emerald-500/20" style={{ width: "40%" }} />
          <div className="h-full bg-amber-500/20" style={{ width: "20%" }} />
          <div className="h-full bg-red-500/20" style={{ width: "40%" }} />
        </div>
        <div
          className={cn("absolute left-0 top-0 h-full rounded-full transition-all duration-700", barColor)}
          style={{ width: `${ratio}%` }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>0%</span>
        <span className="text-emerald-400/70">40% safe</span>
        <span className="text-amber-400/70">60% limit</span>
        <span>100%</span>
      </div>

      <p className="text-xs text-muted-foreground">
        {formatCurrency(emi)}/mo EMI on {formatCurrency(income)}/mo income
      </p>
    </div>
  );
}
