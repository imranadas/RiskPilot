import Link from "next/link";
import {
  ArrowRight,
  Upload,
  Brain,
  BarChart3,
  ShieldCheck,
  Zap,
  FileText,
  TrendingUp,
  PieChart,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/50 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">RiskPilot</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-4xl">
          <Badge variant="secondary" className="mb-6 text-sm">
            Powered by Llama 3.3 · Instant AI Analysis
          </Badge>
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight lg:text-6xl">
            Know the risk before{" "}
            <span className="text-primary">you approve</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
            Upload any CIBIL, Experian, Equifax, or CRIF credit report. RiskPilot
            extracts 14 structured data points, computes a weighted factor scorecard,
            and delivers an Approve / Review / Reject decision with full reasoning —
            in under 30 seconds.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start for free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="gap-2">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border/50 bg-card/40 px-6 py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 text-center sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-primary">{s.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="border-b border-border/50 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-3 text-center text-3xl font-bold">
            Everything your credit team needs
          </h2>
          <p className="mb-12 text-center text-muted-foreground">
            From raw PDF to a boardroom-ready risk report — fully automated.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <f.icon className="mb-4 h-8 w-8 text-primary" />
                <h3 className="mb-2 font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border/50 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-3 text-center text-3xl font-bold">
            Three steps. One decision.
          </h2>
          <p className="mb-12 text-center text-muted-foreground">
            No templates to fill. No manual scoring. Just upload and read.
          </p>
          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                  {i + 1}
                </div>
                <h3 className="mb-2 font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-2xl rounded-xl border border-primary/20 bg-primary/5 p-10 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to analyze your first report?
          </h2>
          <p className="mb-8 text-muted-foreground">
            No credit card required. Upload a bureau PDF and get a full AI risk
            assessment in under 30 seconds.
          </p>
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Create free account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>RiskPilot</span>
          </div>
          <span>Built with Next.js · Supabase · Groq</span>
        </div>
      </footer>
    </div>
  );
}

const STATS = [
  { value: "< 30s", label: "Analysis time" },
  { value: "14", label: "Extracted fields" },
  { value: "5", label: "Weighted risk factors" },
  { value: "4", label: "Bureau formats supported" },
];

const FEATURES = [
  {
    icon: Upload,
    title: "Drag-and-drop upload",
    description:
      "Drop any text-readable credit bureau PDF — CIBIL, Experian, Equifax, or CRIF. No formatting, no manual entry.",
  },
  {
    icon: Brain,
    title: "AI-powered extraction",
    description:
      "Llama 3.3 70B pulls 14 structured fields — credit score, per-loan balances, EMI obligations, missed payments, utilization, and more.",
  },
  {
    icon: BarChart3,
    title: "Weighted factor scorecard",
    description:
      "5-factor breakdown: Payment History (35%), Credit Utilization (30%), Credit Age (15%), Debt Load (10%), Enquiry Activity (10%).",
  },
  {
    icon: ShieldCheck,
    title: "Lending recommendation",
    description:
      "Approve / Review / Reject with a confidence score, suggested credit limit in INR, and full reasoning — no black box.",
  },
  {
    icon: TrendingUp,
    title: "Portfolio dashboard",
    description:
      "Track average score, approval rate, risk distribution, and score trends across all reports in one view.",
  },
  {
    icon: PieChart,
    title: "Debt & utilization charts",
    description:
      "Real per-loan outstanding balances, EMI-to-income ratio bar, utilization gauge, and loan portfolio mix — all from the actual report.",
  },
  {
    icon: Zap,
    title: "Results in under 30s",
    description:
      "The full extraction + analysis pipeline completes in 15–25 seconds on a real bureau report.",
  },
  {
    icon: FileText,
    title: "Searchable history",
    description:
      "Every analysis is stored with a full audit trail. Search by borrower name, filter by risk tier, add loan officer notes.",
  },
  {
    icon: ClipboardList,
    title: "Print-ready reports",
    description:
      "Export any report to PDF in one click. Clean print layout with all charts and scoring visible.",
  },
];

const STEPS = [
  {
    title: "Upload the PDF",
    description:
      "Drag and drop a CIBIL, CRIF, Experian, or Equifax report. Up to 10 MB. Text-readable PDFs only.",
  },
  {
    title: "AI extracts & scores",
    description:
      "Llama 3.3 extracts 14 fields, computes a weighted factor scorecard, and runs a full risk classification — automatically.",
  },
  {
    title: "Read the decision",
    description:
      "Get Approve / Review / Reject with every factor explained, a suggested credit limit, and next actions.",
  },
];
