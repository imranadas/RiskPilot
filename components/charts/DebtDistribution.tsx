"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface DebtDistributionProps {
  loanTypes: string[];
}

const PALETTE = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#ef4444", // red-500
  "#06b6d4", // cyan-500
  "#ec4899", // pink-500
];

export function DebtDistribution({ loanTypes }: DebtDistributionProps) {
  if (!loanTypes?.length) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        No loan data available
      </div>
    );
  }

  // Tally each loan type (handles duplicates gracefully)
  const counts: Record<string, number> = {};
  for (const t of loanTypes) {
    counts[t] = (counts[t] ?? 0) + 1;
  }
  const data = Object.entries(counts).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius="42%"
            outerRadius="68%"
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(222 47% 12%)",
              border: "1px solid hsl(217 33% 22%)",
              borderRadius: "6px",
              fontSize: "12px",
              color: "hsl(210 40% 96%)",
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
