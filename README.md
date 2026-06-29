# RiskPilot — AI Credit Report Analysis

Upload a CIBIL, Experian, Equifax, or CRIF credit bureau report and receive a structured, explainable risk assessment in under 30 seconds — powered by Groq (Llama 3.3 70B).

**Live:** [risk-pilot-beta.vercel.app](https://risk-pilot-beta.vercel.app)

---

## Features

### Upload & Processing
- **Drag-and-drop PDF upload** — accepts any text-readable bureau report up to 10 MB
- **AI extraction** — Groq pulls 14 structured fields: credit score, income, EMIs, missed payments, utilization, per-loan balances, and more
- **Three-step pipeline** — Upload → Extract → Analyze with live progress indicator

### Risk Analysis
- **Risk classification** — Low / Medium / High with confidence percentage
- **Lending decision** — Approve / Review / Reject with suggested credit limit in INR
- **Explainable output** — positive indicators, negative indicators, risk factors, plain-English credit health summary
- **Next actions** — numbered recommendations for the loan officer

### Report Detail
- **Credit score bands** — 6-tier scale (Very Poor → Excellent) with needle indicator and NBFC lending context
- **EMI-to-income ratio** — color-coded bar (green ≤40%, amber 40–60%, red >60%)
- **Debt breakdown** — per-loan-type outstanding amounts extracted directly from the report (not estimated)
- **Credit factor scorecard** — 5-factor weighted breakdown (Payment History 35%, Utilization 30%, Credit Age 15%, Debt Load 10%, Inquiries 10%)
- **Credit utilization gauge** — Recharts radial chart
- **Loan portfolio mix** — donut chart by loan type
- **Print to PDF** — clean print stylesheet, hides UI chrome
- **Loan officer notes** — free-text notes saved per report

### Dashboard
- Portfolio analytics strip — average score, approval rate, monthly volume, risk counts
- Risk distribution donut chart
- Score trend line chart across all reports
- Recent reports with one-click navigation

### Reports History
- Search by customer name or file name
- Filter by status (All / Completed / Processing / Failed)
- Delete reports with confirmation (cascades storage + DB)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | Supabase Auth (SSR pattern via `@supabase/ssr`) |
| Database | Supabase PostgreSQL with Row Level Security |
| Storage | Supabase Storage (private bucket) |
| AI | Groq — `llama-3.3-70b-versatile` |
| PDF parsing | `pdf-parse` (Node.js, server-only) |
| Charts | Recharts |
| Deployment | Vercel |

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/imranadas/RiskPilot.git
cd RiskPilot
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. **SQL Editor** → paste and run the full contents of `supabase/schema.sql`
3. **Storage** → New bucket → name: `credit-reports` → toggle **Private**
4. Copy your Project URL, anon key, and service role key from **Project Settings → API**

### 3. Get a Groq API key

Go to [console.groq.com](https://console.groq.com) → API Keys → Create key

### 4. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GROQ_API_KEY=gsk_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> `SUPABASE_SERVICE_ROLE_KEY` is used only in API routes — never expose it to the browser.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

1. Push repo to GitHub
2. Import in [vercel.com](https://vercel.com) → set **Root Directory** to `RiskPilot`
3. Add all five environment variables (use your Vercel URL for `NEXT_PUBLIC_APP_URL`)
4. Deploy
5. In Supabase → **Authentication → URL Configuration**:
   - **Site URL** → `https://your-app.vercel.app`
   - **Redirect URLs** → add `https://your-app.vercel.app/api/auth/callback`

---

## Database Migrations

The base schema is in `supabase/schema.sql` — run it once for fresh setups.

For existing databases, apply incremental migrations from `supabase/migrations/`:

| File | Change |
|---|---|
| `001_add_loan_breakdown.sql` | Adds `loan_breakdown JSONB` column to `extracted_data` |

Run each migration in **Supabase SQL Editor** in order.

---

## Project Structure

```
RiskPilot/
├── app/
│   ├── (auth)/              # Login + Signup pages
│   ├── (dashboard)/         # Protected: dashboard, upload, reports/[id], settings
│   ├── api/
│   │   ├── upload/          # Store PDF in Supabase Storage
│   │   ├── extract/         # pdf-parse + Groq extraction
│   │   ├── analyze/         # Groq risk analysis
│   │   └── reports/         # List, fetch, update notes, delete
│   └── page.tsx             # Landing page
├── components/
│   ├── analysis/            # CreditScoreCard, RiskBadge, LendingDecision,
│   │                        # EmiIncomeRatio, DebtBreakdownTable, FactorScorecard,
│   │                        # AIInsightsPanel, NextActions, PrintButton, ReportNotes
│   ├── charts/              # UtilizationGauge, DebtDistribution, RiskDistributionChart,
│   │                        # ScoreTrendChart
│   ├── reports/             # ReportsTable (search + filter + delete)
│   ├── settings/            # SettingsForm
│   ├── upload/              # FileDropzone, ProcessingSteps
│   └── ui/                  # shadcn/ui primitives
├── lib/
│   ├── gemini/              # Groq extraction + analysis (client, extract, analyze)
│   ├── pdf/                 # pdf-parse wrapper
│   ├── supabase/            # SSR server client + browser client
│   └── types/               # All TypeScript interfaces
├── supabase/
│   ├── schema.sql           # Full PostgreSQL schema — run once for fresh setup
│   └── migrations/          # Incremental ALTER TABLE scripts for existing DBs
└── .env.example             # Environment variable template
```

---

## API Routes

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/upload` | Store PDF in Supabase Storage, create DB record |
| `POST` | `/api/extract` | Download PDF, parse text, Groq extraction, save structured data |
| `POST` | `/api/analyze` | Groq risk analysis, save ai_analysis, mark report completed |
| `GET` | `/api/reports` | Paginated list of all reports for the authenticated user |
| `GET` | `/api/reports/[id]` | Full report + extracted data + analysis |
| `PATCH` | `/api/reports/[id]` | Update loan officer notes |
| `DELETE` | `/api/reports/[id]` | Delete report from storage and DB (cascades) |

---

## Notes

- PDFs must be text-readable (not scanned images). All standard digital bureau reports qualify.
- The AI extraction prompt explicitly asks for pre-computed per-loan balances — arithmetic expressions in LLM output are sanitized before JSON parsing.
- Confidence scores from the LLM are normalized to 0–100 regardless of whether the model returns a decimal (0.85) or integer (85).
