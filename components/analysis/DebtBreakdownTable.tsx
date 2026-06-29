import { formatCurrency } from "@/lib/utils";

interface Props {
  loanTypes: string[];
  totalOutstanding: number | null;
}

const LOAN_COLORS: Record<string, string> = {
  "Home Loan":        "bg-blue-500",
  "Personal Loan":    "bg-purple-500",
  "Credit Card":      "bg-pink-500",
  "Vehicle Loan":     "bg-cyan-500",
  "Two-Wheeler Loan": "bg-cyan-500",
  "Consumer Loan":    "bg-teal-500",
  "Education Loan":   "bg-indigo-500",
  "Business Loan":    "bg-orange-500",
  "Gold Loan":        "bg-yellow-500",
};

function colorFor(type: string): string {
  return LOAN_COLORS[type] ?? "bg-slate-500";
}

export function DebtBreakdownTable({ loanTypes, totalOutstanding }: Props) {
  if (loanTypes.length === 0) return null;

  const perLoan = totalOutstanding ? totalOutstanding / loanTypes.length : null;

  return (
    <div className="space-y-2.5">
      {loanTypes.map((type, i) => {
        const share = Math.round(100 / loanTypes.length);
        return (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full shrink-0 ${colorFor(type)}`} />
                <span className="font-medium">{type}</span>
              </div>
              <div className="text-right text-muted-foreground tabular-nums">
                {perLoan ? (
                  <span>{formatCurrency(perLoan)}</span>
                ) : (
                  <span>{share}%</span>
                )}
              </div>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className={`h-full rounded-full transition-all duration-500 ${colorFor(type)}`}
                style={{ width: `${share}%` }}
              />
            </div>
          </div>
        );
      })}

      {totalOutstanding && (
        <div className="flex justify-between border-t border-border pt-2 text-xs">
          <span className="text-muted-foreground">Total Outstanding</span>
          <span className="font-semibold">{formatCurrency(totalOutstanding)}</span>
        </div>
      )}
    </div>
  );
}
