import { getGroqClient, EXTRACTION_MODEL } from "./client";
import type { GeminiExtraction } from "@/lib/types";

const MAX_TEXT_CHARS = 15_000;

const PROMPT = (text: string) => `\
You are a credit report data extractor. Read the text below and return a single JSON object.

Return ONLY valid JSON — no markdown, no code fences, no explanation.

Required JSON schema (use null for any field that cannot be found):
{
  "customer_name":      string | null,
  "age":                number | null,
  "occupation":         string | null,
  "credit_score":       number | null,
  "monthly_income":     number | null,
  "active_loans":       number | null,
  "outstanding_balance":number | null,
  "loan_types":         string[] | null,
  "emi_obligations":    number | null,
  "missed_payments":    number | null,
  "credit_utilization": number | null,
  "account_age_months": number | null,
  "hard_inquiries":     number | null
}

Credit Report Text:
---
${text.slice(0, MAX_TEXT_CHARS)}
---`;

function cleanJson(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export async function extractCreditData(rawText: string): Promise<GeminiExtraction> {
  const groq = getGroqClient();

  const completion = await groq.chat.completions.create({
    model: EXTRACTION_MODEL,
    messages: [{ role: "user", content: PROMPT(rawText) }],
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const raw = completion.choices[0]?.message?.content ?? "";

  let parsed: GeminiExtraction;
  try {
    parsed = JSON.parse(cleanJson(raw));
  } catch {
    throw new Error(`AI returned non-JSON for extraction: ${raw.slice(0, 300)}`);
  }

  return parsed;
}
