"use client";

import { useState, useTransition } from "react";
import { StickyNote, Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Props {
  reportId: string;
  initialNotes: string | null;
}

export function ReportNotes({ reportId, initialNotes }: Props) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function handleSave() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/reports/${reportId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes }),
        });
        if (!res.ok) throw new Error();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch {
        toast({ title: "Could not save notes", variant: "destructive" });
      }
    });
  }

  return (
    <Card className="print:hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          <StickyNote className="h-3.5 w-3.5" />
          Loan Officer Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <textarea
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setSaved(false); }}
          placeholder="Add internal notes, observations, or decision rationale for this report…"
          rows={4}
          maxLength={2000}
          className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{notes.length}/2000</span>
          <Button size="sm" onClick={handleSave} disabled={isPending} className="gap-2 h-8">
            {isPending ? (
              <><Loader2 className="h-3 w-3 animate-spin" />Saving…</>
            ) : saved ? (
              <><Check className="h-3 w-3 text-emerald-400" />Saved</>
            ) : (
              "Save Notes"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
