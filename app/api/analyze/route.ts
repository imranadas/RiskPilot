import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { analyzeCreditData } from "@/lib/gemini/analyze";
import type { GeminiExtraction } from "@/lib/types";

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
  let reportId: string, extractedDataId: string;
  try {
    ({ reportId, extractedDataId } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!reportId || !extractedDataId) {
    return NextResponse.json(
      { error: "reportId and extractedDataId are required" },
      { status: 400 }
    );
  }

  const service = createServiceClient();

  const failReport = async (message: string) => {
    await service
      .from("uploaded_reports")
      .update({
        status: "failed",
        error_message: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId);
  };

  // ── Fetch extracted data + verify ownership ──────────────────────────────────
  const { data: extracted, error: extractError } = await service
    .from("extracted_data")
    .select("*")
    .eq("id", extractedDataId)
    .eq("user_id", user.id)
    .single();

  if (extractError || !extracted) {
    return NextResponse.json(
      { error: "Extracted data not found" },
      { status: 404 }
    );
  }

  // ── Gemini analysis ──────────────────────────────────────────────────────────
  const input: GeminiExtraction = {
    customer_name: extracted.customer_name,
    age: extracted.age,
    occupation: extracted.occupation,
    credit_score: extracted.credit_score,
    monthly_income: extracted.monthly_income,
    active_loans: extracted.active_loans,
    outstanding_balance: extracted.outstanding_balance,
    loan_types: extracted.loan_types,
    emi_obligations: extracted.emi_obligations,
    missed_payments: extracted.missed_payments,
    credit_utilization: extracted.credit_utilization,
    account_age_months: extracted.account_age_months,
    hard_inquiries: extracted.hard_inquiries,
  };

  let analysis;
  try {
    analysis = await analyzeCreditData(input);
  } catch (err) {
    console.error("[analyze] ai error:", err);
    await failReport("AI analysis failed");
    return NextResponse.json(
      { error: "AI analysis failed. Please try again." },
      { status: 500 }
    );
  }

  // ── Save to ai_analysis ──────────────────────────────────────────────────────
  const { data: analysisRow, error: dbError } = await service
    .from("ai_analysis")
    .insert({
      report_id: reportId,
      extracted_data_id: extractedDataId,
      user_id: user.id,
      risk_category: analysis.risk_category,
      confidence_score: analysis.confidence_score,
      positive_indicators: analysis.positive_indicators,
      negative_indicators: analysis.negative_indicators,
      risk_factors: analysis.risk_factors,
      credit_health_summary: analysis.credit_health_summary,
      recommended_decision: analysis.recommended_decision,
      suggested_credit_limit: analysis.suggested_credit_limit,
      next_actions: analysis.next_actions,
      model_used: "gemini-1.5-flash",
    })
    .select("id")
    .single();

  if (dbError || !analysisRow) {
    console.error("[analyze] db insert error:", dbError?.message);
    await failReport("Failed to save analysis");
    return NextResponse.json(
      { error: "Failed to save analysis" },
      { status: 500 }
    );
  }

  // ── Mark report completed ────────────────────────────────────────────────────
  await service
    .from("uploaded_reports")
    .update({ status: "completed", updated_at: new Date().toISOString() })
    .eq("id", reportId);

  return NextResponse.json({
    success: true,
    analysisId: analysisRow.id,
    riskCategory: analysis.risk_category,
    recommendedDecision: analysis.recommended_decision,
    confidenceScore: analysis.confidence_score,
  });
}
