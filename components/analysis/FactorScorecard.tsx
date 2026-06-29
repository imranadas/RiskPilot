import { cn } from "@/lib/utils";
import type { ExtractedData } from "@/lib/types";

interface Props {
  data: ExtractedData;
}

interface Factor {
  label: string;
  score: number;
  detail: string;
  weight: number;
}

function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

function computeFactors(data: ExtractedData): Factor[] {
  const factors: Factor[] = [];

  // 1. Payment History (35% weight) — based on missed_payments
  const missed = data.missed_payments ?? 0;
  const paymentScore = missed === 0 ? 100 : missed === 1 ? 70 : missed === 2 ? 45 : clamp(100 - missed * 20);
  factors.push({
    label: "Payment History",
    score: paymentScore,
    detail: missed === 0 ? "No missed payments" : `${missed} missed payment${missed > 1 ? "s" : ""}`,
    weight: 35,
  });

  // 2. Credit Utilization (30% weight)
  const util = data.credit_utilization;
  const utilScore = util == null ? 50
    : util <= 10 ? 100 : util <= 30 ? 85 : util <= 50 ? 60 : util <= 75 ? 35 : 15;
  factors.push({
    label: "Credit Utilization",
    score: utilScore,
    detail: util != null ? `${util}% of credit limit used` : "Data unavailable",
    weight: 30,
  });

  // 3. Credit Age (15% weight)
  const months = data.account_age_months;
  const ageScore = months == null ? 50
    : months >= 120 ? 100 : months >= 72 ? 80 : months >= 36 ? 60 : months >= 12 ? 40 : 20;
  const ageLabel = months != null
    ? `${Math.floor(months / 12)}y ${months % 12}m oldest account`
    : "Data unavailable";
  factors.push({ label: "Credit Age", score: ageScore, detail: ageLabel, weight: 15 });

  // 4. Debt Load (10% weight) — EMI-to-income
  const emi = data.emi_obligations;
  const income = data.monthly_income;
  let debtScore = 70;
  let debtDetail = "Income data unavailable";
  if (emi && income) {
    const ratio = (emi / income) * 100;
    debtScore = ratio <= 20 ? 100 : ratio <= 40 ? 80 : ratio <= 60 ? 50 : 20;
    debtDetail = `${Math.round(ratio)}% EMI-to-income ratio`;
  }
  factors.push({ label: "Debt Load", score: debtScore, detail: debtDetail, weight: 10 });

  // 5. Inquiry Activity (10% weight)
  const inquiries = data.hard_inquiries ?? 0;
  const inqScore = inquiries === 0 ? 100 : inquiries <= 2 ? 80 : inquiries <= 4 ? 55 : clamp(100 - inquiries * 15);
  factors.push({
    label: "Inquiry Activity",
    score: inqScore,
    detail: `${inquiries} hard enquir${inquiries === 1 ? "y" : "ies"}`,
    weight: 10,
  });

  return factors;
}

function scoreColor(score: number) {
  if (score >= 75) return { bar: "bg-emerald-500", text: "text-emerald-400" };
  if (score >= 50) return { bar: "bg-amber-500",   text: "text-amber-400" };
  return { bar: "bg-red-500", text: "text-red-400" };
}

export function FactorScorecard({ data }: Props) {
  const factors = computeFactors(data);
  const weightedScore = Math.round(
    factors.reduce((sum, f) => sum + (f.score * f.weight) / 100, 0)
  );

  return (
    <div className="space-y-4">
      {/* Overall weighted score */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Overall Factor Score</p>
        <p className={cn("text-lg font-bold tabular-nums", scoreColor(weightedScore).text)}>
          {weightedScore}<span className="text-xs font-normal text-muted-foreground">/100</span>
        </p>
      </div>

      {/* Factor bars */}
      <div className="space-y-3">
        {factors.map((f) => {
          const colors = scoreColor(f.score);
          return (
            <div key={f.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{f.label}</span>
                  <span className="text-muted-foreground/60">({f.weight}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{f.detail}</span>
                  <span className={cn("font-semibold tabular-nums w-8 text-right", colors.text)}>
                    {f.score}
                  </span>
                </div>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-border">
                <div
                  className={cn("absolute left-0 top-0 h-full rounded-full transition-all duration-500", colors.bar)}
                  style={{ width: `${f.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground/60 pt-1">
        Weights: Payment 35% · Utilization 30% · Age 15% · Debt 10% · Inquiries 10%
      </p>
    </div>
  );
}
