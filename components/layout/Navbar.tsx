"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/upload": "Upload Report",
  "/reports": "Report History",
  "/settings": "Settings",
};

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const title =
    Object.entries(PAGE_TITLES).find(([path]) =>
      pathname === path || pathname.startsWith(path + "/")
    )?.[1] ?? "RiskPilot";

  const initials =
    user?.user_metadata?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    "U";

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-sm font-semibold">{title}</h1>

      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:block">
          {user?.email}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {initials}
        </div>
      </div>
    </header>
  );
}
