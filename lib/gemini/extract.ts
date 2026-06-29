import { getExtractionModel } from "./client";
import type { GeminiExtraction } from "@/lib/types";

// Truncate text so very long PDFs don't hit token limits or slow Gemini down.
// 15 000 chars ≈ 3 750 tokens — well within Flash's context window.
const MAX_TEXT_CHARS = 15_000;

const PROMPT = (text: string) => `\
You are a credit report data extractor. Read the text below and return a single JSON object.

Return ONLY valid JSON — no markdown, no code fences, no explanation.

Required JSON schema (use null for any field that cannot be found):
{
  "customer_name":      string | null,
  "age":                number | null,
  "occupation":         string | null,
  "credit_score":       number | null,   // primary CIBIL/bureau score, range 300-900
  "monthly_income":     number | null,   // in INR
  "active_loans":       number | null,   // count of open loan accounts
  "outstanding_balance":number | null,   // total principal outstanding, in INR
  "loan_types":         string[] | null, // e.g. ["Home Loan", "Personal Loan", "Credit Card"]
  "emi_obligations":    number | null,   // total monthly EMI amount, in INR
  "missed_payments":    number | null,   // count of missed/late/overdue payments
  "credit_utilization": number | null,   // % of credit limit used, 0-100
  "account_age_months": number | null,   // age of oldest credit account in months
  "hard_inquiries":     number | null    // count of hard credit enquiries
}

Credit Report Text:
---
${text.slice(0, MAX_TEXT_CHARS)}
---`;

function cleanJson(raw: string): string {
  // Strip accidental markdown fences the model may add despite the instruction
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export async function extractCreditData(rawText: string): Promise<GeminiExtraction> {
  const model = getExtractionModel();
  const result = await model.generateContent(PROMPT(rawText));
  const raw = result.response.text();

  let parsed: GeminiExtraction;
  try {
    parsed = JSON.parse(cleanJson(raw));
  } catch {
    throw new Error(`Gemini returned non-JSON for extraction: ${raw.slice(0, 300)}`);
  }

  return parsed;
}
