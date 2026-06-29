import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { AnalysisHistoryRow } from "@/lib/types";
import { TrendingUp, FileText, AlertTriangle, Clock, CheckCircle, BarChart2, Calendar } from "lucide-react";
import { RiskDistributionChart } from "@/components/charts/RiskDistributionChart";
import { ScoreTrendChart } from "@/components/charts/ScoreTrendChart";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: allReports } = await supabase
    .from("analysis_history")
    .select("*")
    .eq("user_id", user!.id)
    .order("uploaded_at", { ascending: false })
    .limit(100);

  const reports = (allReports ?? []) as AnalysisHistoryRow[];
  const completed = reports.filter((r) => r.status === "completed");
  const recentFive = reports.slice(0, 5);
  const hasReports = reports.length > 0;
  const latestReport = completed[0] ?? null;

  // Portfolio stats
  const scoresWithValues = completed.filter((r) => r.credit_score != null);
  const avgScore = scoresWithValues.length > 0
    ? Math.round(scoresWithValues.reduce((s, r) => s + r.credit_score!, 0) / scoresWithValues.length)
    : null;

  const approved = completed.filter((r) => r.recommended_decision === "Approve").length;
  const approvalRate = completed.length > 0 ? Math.round((approved / completed.length) * 100) : null;

  const now = new Date();
  const thisMonthCount = reports.filter((r) => {
    const d = new Date(r.uploaded_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const highRiskCount = completed.filter((r) => r.risk_category === "High Risk").length;

  // Risk distribution
  const lowCount = completed.filter((r) => r.risk_category === "Low Risk").length;
  const medCount = completed.filter((r) => r.risk_category === "Medium Risk").length;

  // Score trend (last 10 with scores, oldest first for chart)
  const scoreTrend = scoresWithValues
    .slice(0, 10)
    .reverse()
    .map((r) => ({ date: r.uploaded_at, score: r.credit_score!, name: r.customer_name }));

  return (
    <div className="space-y-6">
      {/* ── Primary stat cards ───────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Latest Credit Score"
          value={latestReport?.credit_score?.toString() ?? "—"}
          sub="Most recent report"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Reports Analyzed"
          value={reports.length.toString()}
          sub={`${thisMonthCount} this month`}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="High Risk Alerts"
          value={highRiskCount.toString()}
          sub={highRiskCount > 0 ? "Requires attention" : "All clear"}
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
          highlight={highRiskCount > 0 ? "danger" : undefined}
        />
        <StatCard
          title="Last Analysis"
          value={latestReport ? formatDate(latestReport.uploaded_at) : "—"}
          sub={latestReport?.file_name ?? "No reports yet"}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* ── Portfolio analytics strip (only after first completed report) ── */}
      {completed.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Average Credit Score"
            value={avgScore?.toString() ?? "—"}
            sub={`Across ${scoresWithValues.length} completed reports`}
            icon={<BarChart2 className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Approval Rate"
            value={approvalRate != null ? `${approvalRate}%` : "—"}
            sub={`${approved} of ${completed.length} approved`}
            icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
            highlight={approvalRate != null ? (approvalRate >= 60 ? "success" : approvalRate >= 30 ? "warning" : "danger") : undefined}
          />
          <StatCard
            title="This Month"
            value={thisMonthCount.toString()}
            sub="Reports uploaded"
            icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
      )}

      {/* ── Charts row ───────────────────────────────────────────────────── */}
      {completed.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Risk Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RiskDistributionChart low={lowCount} medium={medCount} high={highRiskCount} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Score Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreTrendChart data={scoreTrend} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Recent reports ───────────────────────────────────────────────── */}
      {hasReports ? (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent reports</h2>
            <Link href="/reports" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentFive.map((report) => (
              <ReportCard key={report.report_id} report={report} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function StatCard({
  title, value, sub, icon, highlight,
}: {
  title: string; value: string; sub: string;
  icon: React.ReactNode; highlight?: "success" | "warning" | "danger";
}) {
  const valueColor = highlight === "success" ? "text-emerald-400"
    : highlight === "warning" ? "text-amber-400"
    : highlight === "danger" ? "text-red-400"
    : "";
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        <p className="mt-1 text-xs text-muted-foreground truncate">{sub}</p>
      </CardContent>
    </Card>
  );
}

function ReportCard({ report }: { report: AnalysisHistoryRow }) {
  const riskVariant =
    report.risk_category === "Low Risk" ? "success"
    : report.risk_category === "High Risk" ? "danger"
    : "warning";

  return (
    <Link href={`/reports/${report.report_id}`}>
      <Card className="transition-colors hover:border-primary/30 cursor-pointer">
        <CardContent className="flex items-center justify-between py-4">
          <div className="min-w-0">
            <p className="font-medium truncate">{report.customer_name ?? report.file_name}</p>
            <p className="text-xs text-muted-foreground">{formatDate(report.uploaded_at)}</p>
          </div>
          <div className="flex items-center gap-3 ml-4 flex-shrink-0">
            {report.credit_score && (
              <span className="text-sm font-semibold tabular-nums">{report.credit_score}</span>
            )}
            {report.risk_category ? (
              <Badge variant={riskVariant as "success" | "warning" | "danger"}>{report.risk_category}</Badge>
            ) : (
              <Badge variant="secondary">{report.status}</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
