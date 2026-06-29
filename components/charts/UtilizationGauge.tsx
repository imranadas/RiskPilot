"use client";

import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";

interface UtilizationGaugeProps {
  utilization: number | null;
}

function gaugeColor(pct: number): string {
  if (pct <= 30) return "#10b981"; // emerald-500
  if (pct <= 60) return "#f59e0b"; // amber-500
  return "#ef4444"; // red-500
}

function gaugeLabel(pct: number): string {
  if (pct <= 30) return "Healthy";
  if (pct <= 60) return "Moderate";
  return "High";
}

export function UtilizationGauge({ utilization }: UtilizationGaugeProps) {
  if (utilization == null) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        No data available
      </div>
    );
  }

  const pct = Math.max(0, Math.min(100, utilization));
  const color = gaugeColor(pct);

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="72%"
            innerRadius="58%"
            outerRadius="88%"
            startAngle={180}
            endAngle={0}
            data={[{ value: pct, fill: color }]}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: "hsl(217 33% 17%)" }}
              dataKey="value"
              angleAxisId={0}
              cornerRadius={4}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center overlay */}
        <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-center">
          <p
            className="text-3xl font-bold tabular-nums"
            style={{ color }}
          >
            {pct.toFixed(0)}%
          </p>
          <p className="text-xs" style={{ color }}>
            {gaugeLabel(pct)}
          </p>
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        of credit limit used
      </p>
    </div>
  );
}
