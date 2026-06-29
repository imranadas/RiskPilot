import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { IndicatorList } from "./IndicatorList";

interface AIInsightsPanelProps {
  summary: string | null;
  positiveIndicators: string[];
  negativeIndicators: string[];
  riskFactors: string[];
}

export function AIInsightsPanel({
  summary,
  positiveIndicators,
  negativeIndicators,
  riskFactors,
}: AIInsightsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          AI Credit Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {summary && (
          <p className="text-sm leading-relaxed text-foreground/90">{summary}</p>
        )}

        <Separator />

        <div className="space-y-5">
          <IndicatorList type="positive" items={positiveIndicators} />
          <IndicatorList type="negative" items={negativeIndicators} />
          <IndicatorList type="risk" items={riskFactors} />
        </div>
      </CardContent>
    </Card>
  );
}
