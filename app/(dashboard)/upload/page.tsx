"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { FileDropzone } from "@/components/upload/FileDropzone";
import {
  ProcessingSteps,
  type StepStatus,
  type UploadStep,
} from "@/components/upload/ProcessingSteps";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// ── Step definitions ──────────────────────────────────────────────────────────

const INITIAL_STEPS: UploadStep[] = [
  {
    id: 1,
    label: "Uploading PDF",
    description: "Storing your report securely in the cloud",
    status: "waiting",
  },
  {
    id: 2,
    label: "Extracting data",
    description: "Parsing text and pulling structured fields",
    status: "waiting",
  },
  {
    id: 3,
    label: "Running AI analysis",
    description: "Gemini Flash generating risk assessment",
    status: "waiting",
  },
  {
    id: 4,
    label: "Analysis complete",
    description: "Your report is ready to view",
    status: "waiting",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [steps, setSteps] = useState<UploadStep[]>(INITIAL_STEPS);
  const [processing, setProcessing] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  const isDone = steps.every((s) => s.status === "complete");
  const hasError = steps.some((s) => s.status === "error");
  const isRunning = processing && !isDone && !hasError;
  const showSteps = processing || isDone || hasError;

  function setStep(id: number, status: StepStatus) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  }

  function resetForm() {
    setFile(null);
    setSteps(INITIAL_STEPS);
    setProcessing(false);
    setReportId(null);
    setStepError(null);
  }

  async function handleUploadAndAnalyze() {
    if (!file) return;

    setStepError(null);
    setProcessing(true);
    setSteps(INITIAL_STEPS);

    // ── Step 1: Upload ──────────────────────────────────────────────────────
    setStep(1, "loading");

    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const uploadData = await uploadRes.json();

    if (!uploadRes.ok) {
      setStep(1, "error");
      setStepError(uploadData.error ?? "Upload failed");
      setProcessing(false);
      return;
    }

    setStep(1, "complete");
    const currentReportId: string = uploadData.reportId;
    setReportId(currentReportId);

    // ── Step 2: Extract ─────────────────────────────────────────────────────
    setStep(2, "loading");

    const extractRes = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId: currentReportId }),
    });
    const extractData = await extractRes.json();

    if (!extractRes.ok) {
      setStep(2, "error");
      setStepError(extractData.error ?? "Data extraction failed");
      setProcessing(false);
      return;
    }

    setStep(2, "complete");

    // ── Step 3: Analyze ─────────────────────────────────────────────────────
    setStep(3, "loading");

    const analyzeRes = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId: currentReportId,
        extractedDataId: extractData.extractedDataId,
      }),
    });
    const analyzeData = await analyzeRes.json();

    if (!analyzeRes.ok) {
      setStep(3, "error");
      setStepError(analyzeData.error ?? "AI analysis failed");
      setProcessing(false);
      return;
    }

    setStep(3, "complete");

    // ── Step 4: Done ────────────────────────────────────────────────────────
    setStep(4, "complete");
    setProcessing(false);
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      {/* Upload card — hide once fully done so the page focuses on the result */}
      {!isDone && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Credit Report</CardTitle>
            <CardDescription>
              CIBIL, CRIF, Experian, or Equifax · text-readable PDF only
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileDropzone
              onFileAccepted={setFile}
              onFileCleared={() => setFile(null)}
              disabled={isRunning}
            />

            {file && !isRunning && !hasError && (
              <Button
                className="w-full"
                onClick={handleUploadAndAnalyze}
              >
                Upload and Analyze
              </Button>
            )}

            {hasError && (
              <Button
                variant="outline"
                className="w-full"
                onClick={resetForm}
              >
                Try again
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Processing / result card */}
      {showSteps && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {isDone ? "Analysis ready" : "Processing…"}
            </CardTitle>
            {isRunning && (
              <CardDescription className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                Typically takes 15–25 seconds
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <ProcessingSteps
              steps={steps}
              reportId={reportId}
              errorMessage={stepError}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
