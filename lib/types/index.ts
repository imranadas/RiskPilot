// ─── Database row shapes ──────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  organization: string | null;
  created_at: string;
}

export type ReportStatus = "uploaded" | "processing" | "completed" | "failed";
export type RiskCategory = "Low Risk" | "Medium Risk" | "High Risk";
export type RecommendedDecision = "Approve" | "Review" | "Reject";

export interface UploadedReport {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  report_type: string;
  status: ReportStatus;
  error_message: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExtractedData {
  id: string;
  report_id: string;
  user_id: string;
  customer_name: string | null;
  age: number | null;
  occupation: string | null;
  credit_score: number | null;
  monthly_income: number | null;
  active_loans: number;
  outstanding_balance: number;
  loan_types: string[];
  loan_breakdown: Record<string, number> | null;
  emi_obligations: number;
  missed_payments: number;
  credit_utilization: number | null;
  account_age_months: number | null;
  hard_inquiries: number;
  raw_text: string | null;
  created_at: string;
}

export interface AIAnalysis {
  id: string;
  report_id: string;
  extracted_data_id: string;
  user_id: string;
  risk_category: RiskCategory;
  confidence_score: number | null;
  positive_indicators: string[];
  negative_indicators: string[];
  risk_factors: string[];
  credit_health_summary: string | null;
  recommended_decision: RecommendedDecision;
  suggested_credit_limit: number | null;
  next_actions: string[];
  model_used: string;
  created_at: string;
}

// ─── View / join shapes ───────────────────────────────────────────────────────

export interface AnalysisHistoryRow {
  report_id: string;
  user_id: string;
  file_name: string;
  report_type: string;
  status: ReportStatus;
  uploaded_at: string;
  customer_name: string | null;
  credit_score: number | null;
  active_loans: number | null;
  outstanding_balance: number | null;
  risk_category: RiskCategory | null;
  confidence_score: number | null;
  recommended_decision: RecommendedDecision | null;
  suggested_credit_limit: number | null;
}

export interface FullReport {
  report: UploadedReport;
  extractedData: ExtractedData | null;
  analysis: AIAnalysis | null;
}

// ─── API response wrappers ────────────────────────────────────────────────────

export interface UploadResponse {
  success: boolean;
  reportId: string;
  filePath: string;
}

export interface ExtractResponse {
  success: boolean;
  extractedDataId: string;
  customerName: string | null;
  creditScore: number | null;
}

export interface AnalyzeResponse {
  success: boolean;
  analysisId: string;
  riskCategory: RiskCategory;
  recommendedDecision: RecommendedDecision;
  confidenceScore: number | null;
}

export interface ReportsListResponse {
  reports: AnalysisHistoryRow[];
  total: number;
  page: number;
}

// ─── Gemini extraction / analysis shapes ─────────────────────────────────────

export interface GeminiExtraction {
  customer_name: string | null;
  age: number | null;
  occupation: string | null;
  credit_score: number | null;
  monthly_income: number | null;
  active_loans: number | null;
  outstanding_balance: number | null;
  loan_types: string[] | null;
  loan_breakdown: Record<string, number> | null;
  emi_obligations: number | null;
  missed_payments: number | null;
  credit_utilization: number | null;
  account_age_months: number | null;
  hard_inquiries: number | null;
}

export interface GeminiAnalysis {
  risk_category: RiskCategory;
  confidence_score: number;
  positive_indicators: string[];
  negative_indicators: string[];
  risk_factors: string[];
  credit_health_summary: string;
  recommended_decision: RecommendedDecision;
  suggested_credit_limit: number;
  next_actions: string[];
}
