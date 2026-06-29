-- ============================================================
-- RiskPilot — Full PostgreSQL Schema
-- Run this entire file in Supabase SQL Editor (one paste)
-- ============================================================


-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  organization  TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create a profile row whenever a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- UPLOADED REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS uploaded_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name     TEXT NOT NULL,
  file_path     TEXT NOT NULL,
  file_size     INTEGER,
  report_type   TEXT DEFAULT 'Unknown',
  status        TEXT DEFAULT 'uploaded'
    CHECK (status IN ('uploaded', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- EXTRACTED DATA
-- ============================================================
CREATE TABLE IF NOT EXISTS extracted_data (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id            UUID NOT NULL REFERENCES uploaded_reports(id) ON DELETE CASCADE,
  user_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- Customer
  customer_name        TEXT,
  age                  INTEGER,
  occupation           TEXT,
  credit_score         INTEGER,
  monthly_income       NUMERIC(12, 2),
  -- Loans
  active_loans         INTEGER DEFAULT 0,
  outstanding_balance  NUMERIC(14, 2) DEFAULT 0,
  loan_types           JSONB DEFAULT '[]',
  emi_obligations      NUMERIC(12, 2) DEFAULT 0,
  -- Behavior
  missed_payments      INTEGER DEFAULT 0,
  credit_utilization   NUMERIC(5, 2),
  account_age_months   INTEGER,
  hard_inquiries       INTEGER DEFAULT 0,
  -- Raw
  raw_text             TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- AI ANALYSIS
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_analysis (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id              UUID NOT NULL REFERENCES uploaded_reports(id) ON DELETE CASCADE,
  extracted_data_id      UUID NOT NULL REFERENCES extracted_data(id) ON DELETE CASCADE,
  user_id                UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- Risk
  risk_category          TEXT NOT NULL
    CHECK (risk_category IN ('Low Risk', 'Medium Risk', 'High Risk')),
  confidence_score       NUMERIC(5, 2),
  -- Indicators
  positive_indicators    JSONB DEFAULT '[]',
  negative_indicators    JSONB DEFAULT '[]',
  risk_factors           JSONB DEFAULT '[]',
  -- Decision
  credit_health_summary  TEXT,
  recommended_decision   TEXT
    CHECK (recommended_decision IN ('Approve', 'Review', 'Reject')),
  suggested_credit_limit NUMERIC(14, 2),
  next_actions           JSONB DEFAULT '[]',
  -- Meta
  model_used             TEXT DEFAULT 'gemini-2.0-flash-lite',
  created_at             TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- ANALYSIS HISTORY VIEW (convenience join used by the frontend)
-- ============================================================
CREATE OR REPLACE VIEW analysis_history
  WITH (security_invoker = true)
AS
SELECT
  r.id                  AS report_id,
  r.user_id,
  r.file_name,
  r.report_type,
  r.status,
  r.error_message,
  r.created_at          AS uploaded_at,
  e.customer_name,
  e.credit_score,
  e.active_loans,
  e.outstanding_balance,
  a.risk_category,
  a.confidence_score,
  a.recommended_decision,
  a.suggested_credit_limit
FROM uploaded_reports r
LEFT JOIN extracted_data e ON e.report_id = r.id
LEFT JOIN ai_analysis    a ON a.report_id = r.id
ORDER BY r.created_at DESC;


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_data   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis      ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile"   ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
-- Allows the handle_new_user trigger (SECURITY DEFINER) to insert new rows
CREATE POLICY "Service role can insert profile"
  ON profiles FOR INSERT WITH CHECK (true);

-- Reports
CREATE POLICY "Users manage own reports"
  ON uploaded_reports FOR ALL USING (auth.uid() = user_id);

-- Extracted data
CREATE POLICY "Users manage own extracted data"
  ON extracted_data FOR ALL USING (auth.uid() = user_id);

-- AI analysis
CREATE POLICY "Users manage own analysis"
  ON ai_analysis FOR ALL USING (auth.uid() = user_id);


-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_reports_user_id   ON uploaded_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status    ON uploaded_reports(status);
CREATE INDEX IF NOT EXISTS idx_extracted_report  ON extracted_data(report_id);
CREATE INDEX IF NOT EXISTS idx_analysis_report   ON ai_analysis(report_id);
CREATE INDEX IF NOT EXISTS idx_analysis_user     ON ai_analysis(user_id);
