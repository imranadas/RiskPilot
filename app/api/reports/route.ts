import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));
  const offset = (page - 1) * limit;

  const service = createServiceClient();

  const { data: reports, error, count } = await service
    .from("analysis_history")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("uploaded_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("[reports] list error:", error.message);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }

  return NextResponse.json({
    reports: reports ?? [],
    total: count ?? 0,
    page,
  });
}
