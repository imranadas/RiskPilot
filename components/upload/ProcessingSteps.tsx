import Link from "next/link";
import { Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type StepStatus = "waiting" | "loading" | "complete" | "error";

export interface UploadStep {
  id: number;
  label: string;
  description: string;
  status: StepStatus;
}

interface ProcessingStepsProps {
  steps: UploadStep[];
  reportId?: string | null;
  errorMessage?: string | null;
}

export function ProcessingSteps({
  steps,
  reportId,
  errorMessage,
}: ProcessingStepsProps) {
  const allComplete = steps.every((s) => s.status === "complete");

  return (
    <div className="space-y-1">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        return (
          <div key={step.id} className="flex gap-4">
            {/* Indicator column */}
            <div className="flex flex-col items-center">
              <StepIcon status={step.status} index={idx} />
              {!isLast && (
                <div
                  className={cn(
                    "mt-1 w-px flex-1",
                    step.status === "complete"
                      ? "bg-emerald-500/40"
                      : "bg-border"
                  )}
                  style={{ minHeight: "1.5rem" }}
                />
              )}
            </div>

            {/* Content column */}
            <div className={cn("pb-5", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-medium leading-tight",
                  step.status === "waiting" && "text-muted-foreground",
                  step.status === "loading" && "text-foreground",
                  step.status === "complete" && "text-foreground",
                  step.status === "error" && "text-destructive"
                )}
              >
                {step.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {step.status === "error" && errorMessage
                  ? errorMessage
                  : step.description}
              </p>
            </div>
          </div>
        );
      })}

      {allComplete && reportId && (
        <div className="pt-4">
          <Link href={`/reports/${reportId}`}>
            <Button className="w-full">View Analysis Report →</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function StepIcon({
  status,
  index,
}: {
  status: StepStatus;
  index: number;
}) {
  return (
    <div
      className={cn(
        "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all",
        status === "complete" &&
          "border-emerald-500 bg-emerald-500/10",
        status === "loading" &&
          "border-primary bg-primary/10",
        status === "error" &&
          "border-destructive bg-destructive/10",
        status === "waiting" && "border-border bg-background"
      )}
    >
      {status === "complete" && (
        <Check className="h-3.5 w-3.5 text-emerald-500" />
      )}
      {status === "loading" && (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
      )}
      {status === "error" && (
        <X className="h-3.5 w-3.5 text-destructive" />
      )}
      {status === "waiting" && (
        <span className="text-xs font-medium text-muted-foreground">
          {index + 1}
        </span>
      )}
    </div>
  );
}
