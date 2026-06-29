import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceClient();

  // Verify ownership and get the storage path
  const { data: report, error: fetchError } = await service
    .from("uploaded_reports")
    .select("id, file_path")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  // Remove the PDF from storage (best-effort; don't fail the delete if storage errors)
  await service.storage.from("credit-reports").remove([report.file_path]);

  // Delete DB row — FK ON DELETE CASCADE removes extracted_data + ai_analysis
  const { error: deleteError } = await service
    .from("uploaded_reports")
    .delete()
    .eq("id", params.id);

  if (deleteError) {
    console.error("[reports/delete] db error:", deleteError.message);
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const notes: string = typeof body.notes === "string" ? body.notes.slice(0, 2000) : "";

  const service = createServiceClient();

  const { error } = await service
    .from("uploaded_reports")
    .update({ notes, updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: "Failed to save notes" }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceClient();

  const { data: report, error: reportError } = await service
    .from("uploaded_reports")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (reportError || !report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const [{ data: extractedData }, { data: analysis }] = await Promise.all([
    service
      .from("extracted_data")
      .select("*")
      .eq("report_id", params.id)
      .maybeSingle(),
    service
      .from("ai_analysis")
      .select("*")
      .eq("report_id", params.id)
      .maybeSingle(),
  ]);

  return NextResponse.json({
    report,
    extractedData: extractedData ?? null,
    analysis: analysis ?? null,
  });
}
