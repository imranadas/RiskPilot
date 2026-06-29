import Link from "next/link";
import { ArrowRight, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 px-6 text-center">
      <div className="mb-4 rounded-full bg-primary/10 p-4">
        <Upload className="h-8 w-8 text-primary" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">No reports analyzed yet</h3>
      <p className="mb-6 max-w-xs text-sm text-muted-foreground">
        Upload your first credit bureau PDF to get an AI-powered risk analysis in under 30 seconds.
      </p>
      <Link href="/upload">
        <Button className="gap-2">
          Upload a report <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
