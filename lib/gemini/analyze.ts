import { getAnalysisModel } from "./client";
import type { GeminiAnalysis, GeminiExtraction } from "@/lib/types";

const PROMPT = (data: GeminiExtraction) => `\
You are a senior credit risk analyst at an Indian NBFC.
Analyze the extracted credit data below and return a single JSON object.

Return ONLY valid JSON — no markdown, no code fences, no explanation.

Required JSON schema:
{
  "risk_category":          "Low Risk" | "Medium Risk" | "High Risk",
  "confidence_score":       number,    // 0-100
  "positive_indicators":    string[],  // 3-5 concise items
  "negative_indicators":    string[],  // 2-4 concise items
  "risk_factors":           string[],  // 2-4 specific risk flags
  "credit_health_summary":  string,    // 2-3 sentences, plain English, no jargon
  "recommended_decision":   "Approve" | "Review" | "Reject",
  "suggested_credit_limit": number,    // in INR (e.g. 500000)
  "next_actions":           string[]   // 3-5 specific, actionable steps for the borrower
}

Risk tier guidelines:
- Low Risk:    credit_score >= 750, missed_payments = 0, credit_utilization <= 30%  → Approve
- Medium Risk: credit_score 650-749, missed_payments 1-2, credit_utilization 31-60% → Review
- High Risk:   credit_score < 650,  missed_payments >= 3, credit_utilization > 60%  → Reject
When indicators are mixed, use judgment and reflect the dominant pattern.

Suggested credit limit: monthly_income × 3-6 (lower multiplier for higher risk).
If monthly_income is null, estimate from occupation or use 100000 as a conservative default.

Extracted Credit Data:
${JSON.stringify(data, null, 2)}`;

function cleanJson(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export async function analyzeCreditData(
  data: GeminiExtraction
): Promise<GeminiAnalysis> {
  const model = getAnalysisModel();
  const result = await model.generateContent(PROMPT(data));
  const raw = result.response.text();

  let parsed: GeminiAnalysis;
  try {
    parsed = JSON.parse(cleanJson(raw));
  } catch {
    throw new Error(`Gemini returned non-JSON for analysis: ${raw.slice(0, 300)}`);
  }

  // Validate the enum fields so we don't persist garbage
  const validRisk = ["Low Risk", "Medium Risk", "High Risk"];
  const validDecision = ["Approve", "Review", "Reject"];

  if (!validRisk.includes(parsed.risk_category)) {
    parsed.risk_category = "Medium Risk";
  }
  if (!validDecision.includes(parsed.recommended_decision)) {
    parsed.recommended_decision = "Review";
  }

  return parsed;
}
