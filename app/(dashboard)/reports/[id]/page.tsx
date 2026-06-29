import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditScoreCard } from "@/components/analysis/CreditScoreCard";
import { RiskBadge } from "@/components/analysis/RiskBadge";
import { LendingDecision } from "@/components/analysis/LendingDecision";
import { AIInsightsPanel } from "@/components/analysis/AIInsightsPanel";
import { NextActions } from "@/components/analysis/NextActions";
import { UtilizationGauge } from "@/components/charts/UtilizationGauge";
import { DebtDistribution } from "@/components/charts/DebtDistribution";
import { EmiIncomeRatio } from "@/components/analysis/EmiIncomeRatio";
import { DebtBreakdownTable } from "@/components/analysis/DebtBreakdownTable";
import { FactorScorecard } from "@/components/analysis/FactorScorecard";
import { PrintButton } from "@/components/analysis/PrintButton";
import { ReportNotes } from "@/components/analysis/ReportNotes";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const service = createServiceClient();

  const { data: report } = await service
    .from("uploaded_reports")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!report) notFound();

  // Normalize confidence score: DB may store 0-1 decimal from early LLM responses
  function normalizeConfidence(score: number | null): number | null {
    if (score == null) return null;
    return score <= 1 ? Math.round(score * 100) : Math.round(score);
  }

  const [{ data: extracted }, { data: analysis }] = await Promise.all([
    service.from("extracted_data").select("*").eq("report_id", params.id).maybeSingle(),
    service.from("ai_analysis").select("*").eq("report_id", params.id).maybeSingle(),
  ]);

  const loanTypes: string[] = Array.isArray(extracted?.loan_types) ? extracted.loan_types : [];

  return (
    <div className="space-y-6 print:space-y-4">
      {/* ── Page header ── */}
      <div className="flex items-start gap-4 print:hidden">
        <Link href="/reports" className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground" aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="truncate text-xl font-semibold">{extracted?.customer_name ?? report.file_name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(report.created_at)}</span>
            <span className="flex items-center gap-1 truncate max-w-[220px]"><FileText className="h-3.5 w-3.5 shrink-0" />{report.file_name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {analysis && <RiskBadge category={analysis.risk_category} size="lg" />}
          <PrintButton />
        </div>
      </div>

      {/* Print-only header */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-bold">{extracted?.customer_name ?? report.file_name}</h1>
        <p className="text-sm text-gray-500">RiskPilot Credit Analysis · {formatDate(report.created_at)}</p>
      </div>

      <Separator className="print:hidden" />

      {/* ── Two-column grid ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left */}
        <div className="space-y-5">
          {extracted && (
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Customer Profile</CardTitle></CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <DataItem label="Name"           value={extracted.customer_name ?? "—"} />
                  <DataItem label="Age"            value={extracted.age != null ? `${extracted.age} yrs` : "—"} />
                  <DataItem label="Occupation"     value={extracted.occupation ?? "—"} />
                  <DataItem label="Monthly Income" value={extracted.monthly_income != null ? formatCurrency(extracted.monthly_income) : "—"} />
                </dl>
              </CardContent>
            </Card>
          )}

          <CreditScoreCard score={extracted?.credit_score ?? null} />

          {extracted && (
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Loan Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <DataItem label="Active Loans"        value={String(extracted.active_loans ?? 0)} />
                  <DataItem label="Outstanding Balance" value={formatCurrency(extracted.outstanding_balance ?? 0)} />
                  <DataItem label="Monthly EMI"         value={extracted.emi_obligations ? formatCurrency(extracted.emi_obligations) : "—"} />
                </dl>

                {/* EMI-to-Income ratio bar */}
                <EmiIncomeRatio emi={extracted.emi_obligations} income={extracted.monthly_income} />

                {loanTypes.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Loan Types</p>
                    <div className="flex flex-wrap gap-1.5">
                      {loanTypes.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {extracted && (
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Behavioral Metrics</CardTitle></CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <DataItem label="Missed Payments"   value={String(extracted.missed_payments ?? 0)}
                    highlight={(extracted.missed_payments ?? 0) > 0 ? "danger" : "success"} />
                  <DataItem label="Credit Utilization"
                    value={extracted.credit_utilization != null ? `${extracted.credit_utilization}%` : "—"}
                    highlight={extracted.credit_utilization == null ? undefined
                      : extracted.credit_utilization > 60 ? "danger"
                      : extracted.credit_utilization > 30 ? "warning" : "success"} />
                  <DataItem label="Account Age"
                    value={extracted.account_age_months != null
                      ? `${Math.floor(extracted.account_age_months / 12)}y ${extracted.account_age_months % 12}m` : "—"} />
                  <DataItem label="Hard Inquiries" value={String(extracted.hard_inquiries ?? 0)}
                    highlight={(extracted.hard_inquiries ?? 0) > 4 ? "danger" : (extracted.hard_inquiries ?? 0) > 2 ? "warning" : "success"} />
                </dl>
              </CardContent>
            </Card>
          )}

          {/* Factor Scorecard */}
          {extracted && (
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Credit Factor Scorecard</CardTitle></CardHeader>
              <CardContent>
                <FactorScorecard data={extracted} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right */}
        <div className="space-y-5">
          {analysis ? (
            <>
              <Card>
                <CardHeader><CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Risk Assessment</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-between">
                  <RiskBadge category={analysis.risk_category} size="xl" />
                  <div className="text-right">
                    <p className="text-3xl font-bold tabular-nums">
                      {normalizeConfidence(analysis.confidence_score) ?? "—"}<span className="text-base font-normal text-muted-foreground">%</span>
                    </p>
                    <p className="text-xs text-muted-foreground">confidence</p>
                  </div>
                </CardContent>
              </Card>

              <LendingDecision
                decision={analysis.recommended_decision}
                confidence={normalizeConfidence(analysis.confidence_score)}
                suggestedLimit={analysis.suggested_credit_limit}
              />
              <AIInsightsPanel
                summary={analysis.credit_health_summary}
                positiveIndicators={analysis.positive_indicators ?? []}
                negativeIndicators={analysis.negative_indicators ?? []}
                riskFactors={analysis.risk_factors ?? []}
              />
              <NextActions actions={analysis.next_actions ?? []} />
            </>
          ) : (
            <Card>
              <CardContent className="flex min-h-[200px] items-center justify-center py-10">
                <p className="text-center text-sm text-muted-foreground">
                  {report.status === "processing" ? "Analysis is in progress…"
                    : report.status === "failed" ? `Analysis failed: ${report.error_message ?? "Unknown error"}`
                    : "No analysis data available yet."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── Charts + Debt Breakdown row ── */}
      {extracted && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Credit Utilization</CardTitle></CardHeader>
            <CardContent><UtilizationGauge utilization={extracted.credit_utilization} /></CardContent>
          </Card>

          {loanTypes.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Loan Portfolio Mix</CardTitle></CardHeader>
              <CardContent><DebtDistribution loanTypes={loanTypes} /></CardContent>
            </Card>
          )}

          {loanTypes.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Debt Breakdown</CardTitle></CardHeader>
              <CardContent>
                <DebtBreakdownTable
                  loanTypes={loanTypes}
                  totalOutstanding={extracted.outstanding_balance}
                  loanBreakdown={extracted.loan_breakdown}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}
      {/* ── Loan Officer Notes ── */}
      <ReportNotes reportId={report.id} initialNotes={report.notes} />
    </div>
  );
}

function DataItem({ label, value, highlight }: { label: string; value: string; highlight?: "success" | "warning" | "danger" }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("mt-0.5 font-medium",
        highlight === "success" && "text-emerald-400",
        highlight === "warning" && "text-amber-400",
        highlight === "danger"  && "text-red-400"
      )}>{value}</dd>
    </div>
  );
}
