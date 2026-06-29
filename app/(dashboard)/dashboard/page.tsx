import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { AnalysisHistoryRow } from "@/lib/types";
import { TrendingUp, FileText, AlertTriangle, Clock } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch recent reports via the analysis_history view
  const { data: reports } = await supabase
    .from("analysis_history")
    .select("*")
    .eq("user_id", user!.id)
    .order("uploaded_at", { ascending: false })
    .limit(5);

  const hasReports = reports && reports.length > 0;
  const completedReports = (reports ?? []).filter((r: AnalysisHistoryRow) => r.status === "completed");
  const latestReport = completedReports[0] ?? null;

  const highRiskCount = completedReports.filter(
    (r: AnalysisHistoryRow) => r.risk_category === "High Risk"
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary cards — shown when there's at least one completed report */}
      {latestReport && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Latest Credit Score"
            value={latestReport.credit_score?.toString() ?? "—"}
            sub="From most recent report"
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Reports Analyzed"
            value={reports!.length.toString()}
            sub="All time"
            icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="High Risk Alerts"
            value={highRiskCount.toString()}
            sub={highRiskCount > 0 ? "Requires attention" : "No alerts"}
            icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Last Analysis"
            value={formatDate(latestReport.uploaded_at)}
            sub={latestReport.file_name}
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
      )}

      {/* Recent reports */}
      {hasReports ? (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent reports</h2>
            <Link
              href="/reports"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {(reports as AnalysisHistoryRow[]).map((report) => (
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
  title,
  value,
  sub,
  icon,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground truncate">{sub}</p>
      </CardContent>
    </Card>
  );
}

function ReportCard({ report }: { report: AnalysisHistoryRow }) {
  const riskVariant =
    report.risk_category === "Low Risk"
      ? "success"
      : report.risk_category === "High Risk"
      ? "danger"
      : "warning";

  return (
    <Link href={`/reports/${report.report_id}`}>
      <Card className="transition-colors hover:border-primary/30 cursor-pointer">
        <CardContent className="flex items-center justify-between py-4">
          <div className="min-w-0">
            <p className="font-medium truncate">
              {report.customer_name ?? report.file_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(report.uploaded_at)}
            </p>
          </div>
          <div className="flex items-center gap-3 ml-4 flex-shrink-0">
            {report.credit_score && (
              <span className="text-sm font-semibold tabular-nums">
                {report.credit_score}
              </span>
            )}
            {report.risk_category ? (
              <Badge variant={riskVariant as "success" | "warning" | "danger"}>
                {report.risk_category}
              </Badge>
            ) : (
              <Badge variant="secondary">{report.status}</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
