import { redirect } from "next/navigation";
import Link from "next/link";
import { Upload } from "lucide-react";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ReportsTable } from "@/components/reports/ReportsTable";
import type { AnalysisHistoryRow } from "@/lib/types";

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const service = createServiceClient();

  const { data: reports } = await service
    .from("analysis_history")
    .select("*")
    .eq("user_id", user.id)
    .order("uploaded_at", { ascending: false })
    .limit(100);

  const totalCount = reports?.length ?? 0;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Reports</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {totalCount} report{totalCount !== 1 ? "s" : ""} analyzed
          </p>
        </div>
        <Link href="/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </Link>
      </div>

      <ReportsTable
        initialReports={(reports ?? []) as AnalysisHistoryRow[]}
      />
    </div>
  );
}
