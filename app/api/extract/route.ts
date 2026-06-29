import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { extractTextFromPdf } from "@/lib/pdf/extractor";
import { extractCreditData } from "@/lib/gemini/extract";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Parse body ──────────────────────────────────────────────────────────────
  let reportId: string;
  try {
    ({ reportId } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!reportId) {
    return NextResponse.json({ error: "reportId is required" }, { status: 400 });
  }

  const service = createServiceClient();

  // Helper to mark the report failed and return an error response
  const fail = async (message: string, status = 500) => {
    await service
      .from("uploaded_reports")
      .update({
        status: "failed",
        error_message: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);
    return NextResponse.json({ error: message }, { status });
  };

  // ── Fetch report + verify ownership ─────────────────────────────────────────
  const { data: report, error: reportError } = await service
    .from("uploaded_reports")
    .select("*")
    .eq("id", reportId)
    .eq("user_id", user.id)
    .single();

  if (reportError || !report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  // ── Update status → processing ──────────────────────────────────────────────
  await service
    .from("uploaded_reports")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", reportId);

  // ── Download PDF from Supabase Storage ──────────────────────────────────────
  const { data: fileBlob, error: storageError } = await service.storage
    .from("credit-reports")
    .download(report.file_path);

  if (storageError || !fileBlob) {
    return fail("Failed to retrieve PDF from storage");
  }

  const buffer = Buffer.from(await fileBlob.arrayBuffer());

  // ── Extract text with pdf-parse ─────────────────────────────────────────────
  let pdfResult;
  try {
    pdfResult = await extractTextFromPdf(buffer);
  } catch (err) {
    console.error("[extract] pdf-parse error:", err);
    return fail(
      "Failed to parse PDF. Please ensure it is a text-readable PDF, not a scanned image.",
      422
    );
  }

  if (pdfResult.charCount < 100) {
    return fail(
      "This PDF appears to be scanned or contains no readable text. RiskPilot requires a text-based credit report.",
      422
    );
  }

  // ── Gemini structured extraction ─────────────────────────────────────────────
  let extracted;
  try {
    extracted = await extractCreditData(pdfResult.text);
  } catch (err) {
    console.error("[extract] ai error:", err);
    return fail("AI extraction failed. Please try again.");
  }

  // ── Save to extracted_data ───────────────────────────────────────────────────
  const { data: extractedRow, error: dbError } = await service
    .from("extracted_data")
    .insert({
      report_id: reportId,
      user_id: user.id,
      customer_name: extracted.customer_name,
      age: extracted.age,
      occupation: extracted.occupation,
      credit_score: extracted.credit_score,
      monthly_income: extracted.monthly_income,
      active_loans: extracted.active_loans ?? 0,
      outstanding_balance: extracted.outstanding_balance ?? 0,
      loan_types: extracted.loan_types ?? [],
      emi_obligations: extracted.emi_obligations ?? 0,
      missed_payments: extracted.missed_payments ?? 0,
      credit_utilization: extracted.credit_utilization,
      account_age_months: extracted.account_age_months,
      hard_inquiries: extracted.hard_inquiries ?? 0,
      raw_text: pdfResult.text,
    })
    .select("id")
    .single();

  if (dbError || !extractedRow) {
    console.error("[extract] db insert error:", dbError?.message);
    return fail("Failed to save extracted data");
  }

  return NextResponse.json({
    success: true,
    extractedDataId: extractedRow.id,
    customerName: extracted.customer_name,
    creditScore: extracted.credit_score,
  });
}
