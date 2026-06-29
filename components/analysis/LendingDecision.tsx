import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import type { RecommendedDecision } from "@/lib/types";

interface LendingDecisionProps {
  decision: RecommendedDecision;
  confidence: number | null;
  suggestedLimit: number | null;
}

type DecisionConfig = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  bg: string;
  text: string;
  border: string;
};

const CONFIG: Record<RecommendedDecision, DecisionConfig> = {
  Approve: {
    icon: CheckCircle2,
    label: "Approve",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  Review: {
    icon: AlertCircle,
    label: "Manual Review",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
  Reject: {
    icon: XCircle,
    label: "Reject",
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
  },
};

export function LendingDecision({
  decision,
  confidence,
  suggestedLimit,
}: LendingDecisionProps) {
  const { icon: Icon, label, bg, text, border } = CONFIG[decision];

  return (
    <Card className={cn("border", border)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Lending Decision
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={cn("flex items-center gap-3 rounded-lg p-3", bg)}>
          <Icon className={cn("h-6 w-6 shrink-0", text)} />
          <div>
            <p className={cn("text-lg font-bold", text)}>{label}</p>
            {confidence != null && (
              <p className="text-xs text-muted-foreground">
                {confidence}% confidence
              </p>
            )}
          </div>
        </div>

        {suggestedLimit != null && (
          <div className="flex items-center justify-between rounded-lg bg-card/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Suggested Credit Limit</span>
            <span className="font-semibold tabular-nums">
              {formatCurrency(suggestedLimit)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
