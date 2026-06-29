import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NextActionsProps {
  actions: string[];
}

export function NextActions({ actions }: NextActionsProps) {
  if (!actions?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Recommended Next Steps
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {actions.map((action, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {i + 1}
              </span>
              <span className="pt-0.5 leading-snug">{action}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
