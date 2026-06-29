import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CreditScoreCardProps {
  score: number | null;
}

function scoreColor(score: number): string {
  if (score >= 750) return "text-emerald-400";
  if (score >= 650) return "text-amber-400";
  return "text-red-400";
}

function scoreFillClass(score: number): string {
  if (score >= 750) return "bg-emerald-500";
  if (score >= 650) return "bg-amber-500";
  return "bg-red-500";
}

function scoreLabel(score: number): string {
  if (score >= 800) return "Excellent";
  if (score >= 750) return "Good";
  if (score >= 700) return "Fair";
  if (score >= 650) return "Poor";
  return "Very Poor";
}

export function CreditScoreCard({ score }: CreditScoreCardProps) {
  // Map 300-900 → 0-100%
  const pct =
    score != null
      ? Math.max(0, Math.min(100, ((score - 300) / 600) * 100))
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Credit Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {score != null ? (
          <>
            <div className="flex items-end gap-3">
              <span
                className={cn(
                  "text-5xl font-bold tabular-nums",
                  scoreColor(score)
                )}
              >
                {score}
              </span>
              <div className="mb-1">
                <p className={cn("text-sm font-medium", scoreColor(score))}>
                  {scoreLabel(score)}
                </p>
                <p className="text-xs text-muted-foreground">out of 900</p>
              </div>
            </div>

            {/* Visual meter */}
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-border">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 opacity-20" />
              <div
                className={cn(
                  "absolute left-0 top-0 h-full rounded-full transition-all duration-500",
                  scoreFillClass(score)
                )}
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>300</span>
              <span>550</span>
              <span>700</span>
              <span>900</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Score not available</p>
        )}
      </CardContent>
    </Card>
  );
}
