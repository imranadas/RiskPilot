import { getGroqClient, ANALYSIS_MODEL } from "./client";
import type { GeminiAnalysis, GeminiExtraction } from "@/lib/types";

const PROMPT = (data: GeminiExtraction) => `\
You are a senior credit risk analyst at an Indian NBFC.
Analyze the extracted credit data below and return a single JSON object.

Return ONLY valid JSON — no markdown, no code fences, no explanation.

Required JSON schema:
{
  "risk_category":          "Low Risk" | "Medium Risk" | "High Risk",
  "confidence_score":       number,   // integer 0-100 representing percentage confidence
  "positive_indicators":    string[],
  "negative_indicators":    string[],
  "risk_factors":           string[],
  "credit_health_summary":  string,
  "recommended_decision":   "Approve" | "Review" | "Reject",
  "suggested_credit_limit": number,
  "next_actions":           string[]
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

export async function analyzeCreditData(data: GeminiExtraction): Promise<GeminiAnalysis> {
  const groq = getGroqClient();

  const completion = await groq.chat.completions.create({
    model: ANALYSIS_MODEL,
    messages: [{ role: "user", content: PROMPT(data) }],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const raw = completion.choices[0]?.message?.content ?? "";

  let parsed: GeminiAnalysis;
  try {
    parsed = JSON.parse(cleanJson(raw));
  } catch {
    throw new Error(`AI returned non-JSON for analysis: ${raw.slice(0, 300)}`);
  }

  const validRisk = ["Low Risk", "Medium Risk", "High Risk"];
  const validDecision = ["Approve", "Review", "Reject"];

  if (!validRisk.includes(parsed.risk_category)) parsed.risk_category = "Medium Risk";
  if (!validDecision.includes(parsed.recommended_decision)) parsed.recommended_decision = "Review";

  // Normalize confidence: LLMs sometimes return 0-1 decimal instead of 0-100
  if (parsed.confidence_score != null && parsed.confidence_score <= 1) {
    parsed.confidence_score = Math.round(parsed.confidence_score * 100);
  }

  return parsed;
}
