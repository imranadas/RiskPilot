import { formatCurrency } from "@/lib/utils";

interface Props {
  loanTypes: string[];
  totalOutstanding: number | null;
  loanBreakdown: Record<string, number> | null;
}

const LOAN_COLORS: Record<string, string> = {
  "Home Loan":        "bg-blue-500",
  "Personal Loan":    "bg-purple-500",
  "Credit Card":      "bg-pink-500",
  "Vehicle Loan":     "bg-cyan-500",
  "Car Loan":         "bg-cyan-500",
  "Two-Wheeler Loan": "bg-sky-500",
  "Consumer Loan":    "bg-teal-500",
  "Education Loan":   "bg-indigo-500",
  "Business Loan":    "bg-orange-500",
  "Gold Loan":        "bg-yellow-500",
};

function colorFor(type: string): string {
  return LOAN_COLORS[type] ?? "bg-slate-500";
}

export function DebtBreakdownTable({ loanTypes, totalOutstanding, loanBreakdown }: Props) {
  if (loanTypes.length === 0) return null;

  // Build per-type entries from real breakdown data, or fall back to equal split
  const hasReal = loanBreakdown && Object.keys(loanBreakdown).length > 0;

  const entries: { type: string; amount: number | null; pct: number }[] = loanTypes.map((type) => {
    if (hasReal) {
      // Match by key, case-insensitive fallback
      const amount =
        loanBreakdown[type] ??
        Object.entries(loanBreakdown).find(([k]) => k.toLowerCase() === type.toLowerCase())?.[1] ??
        null;
      const total = Object.values(loanBreakdown).reduce((s, v) => s + v, 0);
      const pct = amount != null && total > 0 ? Math.round((amount / total) * 100) : 0;
      return { type, amount, pct };
    } else {
      // Equal split fallback — amounts unknown
      const pct = Math.round(100 / loanTypes.length);
      return { type, amount: null, pct };
    }
  });

  const displayTotal =
    totalOutstanding ??
    (hasReal ? Object.values(loanBreakdown!).reduce((s, v) => s + v, 0) : null);

  return (
    <div className="space-y-2.5">
      {entries.map(({ type, amount, pct }, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full shrink-0 ${colorFor(type)}`} />
              <span className="font-medium">{type}</span>
            </div>
            <span className="text-right text-muted-foreground tabular-nums">
              {amount != null ? formatCurrency(amount) : `${pct}%`}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className={`h-full rounded-full transition-all duration-500 ${colorFor(type)}`}
              style={{ width: `${Math.max(pct, 2)}%` }}
            />
          </div>
        </div>
      ))}

      {displayTotal != null && (
        <div className="flex justify-between border-t border-border pt-2 text-xs">
          <span className="text-muted-foreground">Total Outstanding</span>
          <span className="font-semibold">{formatCurrency(displayTotal)}</span>
        </div>
      )}

      {!hasReal && (
        <p className="text-[10px] text-muted-foreground/60 italic">
          Per-loan breakdown not available — re-process to extract individual balances.
        </p>
      )}
    </div>
  );
}
