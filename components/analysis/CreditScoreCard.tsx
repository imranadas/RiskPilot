import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CreditScoreCardProps {
  score: number | null;
}

const BANDS = [
  { label: "Very Poor", min: 300, max: 579, color: "bg-red-500",    textColor: "text-red-400" },
  { label: "Poor",      min: 580, max: 649, color: "bg-orange-500", textColor: "text-orange-400" },
  { label: "Fair",      min: 650, max: 699, color: "bg-amber-500",  textColor: "text-amber-400" },
  { label: "Good",      min: 700, max: 749, color: "bg-yellow-400", textColor: "text-yellow-400" },
  { label: "Very Good", min: 750, max: 799, color: "bg-lime-500",   textColor: "text-lime-400" },
  { label: "Excellent", min: 800, max: 900, color: "bg-emerald-500",textColor: "text-emerald-400" },
];

function getBand(score: number) {
  return BANDS.find((b) => score >= b.min && score <= b.max) ?? BANDS[0];
}

function scoreColor(score: number): string {
  return getBand(score).textColor;
}

export function CreditScoreCard({ score }: CreditScoreCardProps) {
  const pct = score != null
    ? Math.max(0, Math.min(100, ((score - 300) / 600) * 100))
    : 0;
  const band = score != null ? getBand(score) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Credit Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {score != null && band ? (
          <>
            <div className="flex items-end gap-3">
              <span className={cn("text-5xl font-bold tabular-nums", scoreColor(score))}>
                {score}
              </span>
              <div className="mb-1">
                <p className={cn("text-sm font-semibold", scoreColor(score))}>{band.label}</p>
                <p className="text-xs text-muted-foreground">out of 900</p>
              </div>
            </div>

            {/* Gradient meter with position indicator */}
            <div className="space-y-1.5">
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-border">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 opacity-30" />
                <div
                  className={cn("absolute left-0 top-0 h-full rounded-full transition-all duration-700", band.color)}
                  style={{ width: `${pct}%` }}
                />
                {/* Needle */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-white/80 rounded-full"
                  style={{ left: `calc(${pct}% - 1px)` }}
                />
              </div>

              {/* Range labels */}
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>300</span>
                <span>580</span>
                <span>650</span>
                <span>700</span>
                <span>750</span>
                <span>800</span>
                <span>900</span>
              </div>
            </div>

            {/* Benchmark band legend */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {BANDS.map((b) => (
                <div
                  key={b.label}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors",
                    band.label === b.label
                      ? "bg-card border border-border ring-1 ring-primary/40"
                      : "bg-muted/30"
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full shrink-0", b.color)} />
                  <span className={band.label === b.label ? b.textColor : "text-muted-foreground"}>
                    {b.label}
                  </span>
                </div>
              ))}
            </div>

            {/* NBFC lending context */}
            <p className="text-xs text-muted-foreground border-t border-border pt-3">
              {score >= 750
                ? "Strong profile — most lenders will approve at competitive rates."
                : score >= 700
                ? "Acceptable profile — approval likely with standard terms."
                : score >= 650
                ? "Borderline profile — some lenders may require collateral or co-applicant."
                : "High-risk profile — most NBFCs will decline or offer sub-prime terms."}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Score not available</p>
        )}
      </CardContent>
    </Card>
  );
}
