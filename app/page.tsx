import Link from "next/link";
import {
  ArrowRight,
  Upload,
  Brain,
  BarChart3,
  ShieldCheck,
  Zap,
  FileText,
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
              <Button variant="ghost" size="sm">
                Log in
              </Button>
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
            Powered by Gemini Flash · Instant AI Analysis
          </Badge>
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight lg:text-6xl">
            Credit analysis in{" "}
            <span className="text-primary">30 seconds</span>,{" "}
            <br className="hidden sm:block" />
            not 30 minutes
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
            Upload a CIBIL, CRIF, Experian, or Equifax report. RiskPilot
            extracts every relevant field and returns a structured risk
            assessment with an AI-generated lending recommendation — instantly.

          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start for free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="gap-2">
                View demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="border-t border-border/50 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Everything you need, nothing you don't
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-border bg-card p-6"
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
      <section className="border-t border-border/50 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Three steps. One decision.
          </h2>
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
      <section className="border-t border-border/50 px-6 py-20">
        <div className="mx-auto max-w-2xl rounded-xl border border-primary/20 bg-primary/5 p-10 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to analyze your first report?
          </h2>
          <p className="mb-8 text-muted-foreground">
            No credit card required. Upload a PDF and get your first AI analysis
            free.
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
          <span>Built with Next.js · Supabase · Gemini Flash</span>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  {
    icon: Upload,
    title: "Drag-and-drop upload",
    description:
      "Drop any text-readable credit bureau PDF. No formatting, no manual data entry.",
  },
  {
    icon: Brain,
    title: "AI-powered extraction",
    description:
      "Gemini Flash pulls 13+ structured fields — credit score, EMIs, missed payments, utilization — in seconds.",
  },
  {
    icon: BarChart3,
    title: "Explainable risk analysis",
    description:
      "Low / Medium / High risk rating with positive indicators, red flags, and a plain-English summary.",
  },
  {
    icon: ShieldCheck,
    title: "Lending recommendation",
    description:
      "Approve / Review / Reject with a confidence score and suggested credit limit in INR.",
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
      "Every analysis is stored and accessible. Full audit trail for teams reviewing dozens of applications a day.",
  },
];

const STEPS = [
  {
    title: "Upload the PDF",
    description:
      "Drag and drop a CIBIL, CRIF, Experian, or Equifax report. Up to 10 MB.",
  },
  {
    title: "AI extracts & analyzes",
    description:
      "We parse the text, run structured extraction, then a full risk analysis — all automatically.",
  },
  {
    title: "Read the decision",
    description:
      "A clear Approve / Review / Reject with every factor explained. No black box.",
  },
];
