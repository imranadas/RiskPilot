"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ExternalLink, AlertTriangle, Upload } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/analysis/RiskBadge";
import { useToast } from "@/hooks/use-toast";
import { cn, formatDate } from "@/lib/utils";
import type { AnalysisHistoryRow, ReportStatus } from "@/lib/types";

const STATUS_TABS: { label: string; value: ReportStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "Processing", value: "processing" },
  { label: "Failed", value: "failed" },
];

interface ReportsTableProps {
  initialReports: AnalysisHistoryRow[];
}

export function ReportsTable({ initialReports }: ReportsTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [reports, setReports] = useState<AnalysisHistoryRow[]>(initialReports);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered =
    statusFilter === "all"
      ? reports
      : reports.filter((r) => r.status === statusFilter);

  async function handleDelete() {
    if (!pendingDeleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/reports/${pendingDeleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Server error");

      setReports((prev) =>
        prev.filter((r) => r.report_id !== pendingDeleteId)
      );
      toast({
        title: "Report deleted",
        description: "The report and its analysis have been removed.",
      });
      router.refresh();
    } catch {
      toast({
        title: "Delete failed",
        description: "Could not delete the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setPendingDeleteId(null);
    }
  }

  // Empty state — no reports at all
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center">
        <p className="text-sm font-medium">No reports yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload a credit report to get started
        </p>
        <Link href="/upload" className="mt-5">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Report
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status filter tabs */}
      <div className="flex gap-1 rounded-lg bg-card/60 p-1 w-fit border border-border">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              statusFilter === tab.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empty filtered state */}
      {filtered.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">
            No {statusFilter} reports.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Customer</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Decision</TableHead>
                <TableHead className="text-center">Confidence</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[72px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((report) => (
                <ReportRow
                  key={report.report_id}
                  report={report}
                  onDelete={() => setPendingDeleteId(report.report_id)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!pendingDeleteId}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Report
            </DialogTitle>
            <DialogDescription>
              This will permanently delete the report PDF and all associated
              analysis data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isDeleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Row sub-component ──────────────────────────────────────────────────────────

function ReportRow({
  report,
  onDelete,
}: {
  report: AnalysisHistoryRow;
  onDelete: () => void;
}) {
  return (
    <TableRow className="group">
      {/* Customer / filename */}
      <TableCell className="font-medium">
        <Link
          href={`/reports/${report.report_id}`}
          className="hover:text-primary transition-colors"
        >
          {report.customer_name ?? (
            <span className="italic text-muted-foreground">
              {report.file_name}
            </span>
          )}
        </Link>
      </TableCell>

      {/* Credit score */}
      <TableCell className="text-center tabular-nums">
        {report.credit_score ?? (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>

      {/* Risk level */}
      <TableCell>
        {report.risk_category ? (
          <RiskBadge category={report.risk_category} size="sm" />
        ) : (
          <StatusPill status={report.status} />
        )}
      </TableCell>

      {/* Decision */}
      <TableCell>
        {report.recommended_decision ? (
          <DecisionPill decision={report.recommended_decision} />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>

      {/* Confidence */}
      <TableCell className="text-center tabular-nums text-sm">
        {report.confidence_score != null ? (
          `${report.confidence_score}%`
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>

      {/* Date */}
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(report.uploaded_at)}
      </TableCell>

      {/* Actions — revealed on row hover */}
      <TableCell>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Link href={`/reports/${report.report_id}`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              tabIndex={-1}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="sr-only">View report</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete report</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ── Small inline pill components ───────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    uploaded:   "bg-blue-500/15 text-blue-400",
    processing: "bg-amber-500/15 text-amber-400",
    completed:  "bg-emerald-500/15 text-emerald-400",
    failed:     "bg-red-500/15 text-red-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      {status}
    </span>
  );
}

function DecisionPill({ decision }: { decision: string }) {
  const styles: Record<string, string> = {
    Approve: "bg-emerald-500/15 text-emerald-400",
    Review:  "bg-amber-500/15 text-amber-400",
    Reject:  "bg-red-500/15 text-red-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[decision] ?? "bg-muted text-muted-foreground"
      )}
    >
      {decision}
    </span>
  );
}
