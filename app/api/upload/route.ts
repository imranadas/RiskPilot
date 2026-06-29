import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Parse multipart body ──────────────────────────────────────────────────
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // ── Validate ──────────────────────────────────────────────────────────────
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are accepted" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 10 MB" },
        { status: 400 }
      );
    }

    // ── Prepare storage path ──────────────────────────────────────────────────
    const reportId = crypto.randomUUID();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${user.id}/${reportId}/${safeFileName}`;

    const buffer = new Uint8Array(await file.arrayBuffer());
    const service = createServiceClient();

    // ── Upload to Supabase Storage ────────────────────────────────────────────
    const { error: storageError } = await service.storage
      .from("credit-reports")
      .upload(filePath, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (storageError) {
      console.error("[upload] storage error:", storageError.message);
      return NextResponse.json(
        { error: "Failed to store file. Please try again." },
        { status: 500 }
      );
    }

    // ── Insert DB record ──────────────────────────────────────────────────────
    const { error: dbError } = await service.from("uploaded_reports").insert({
      id: reportId,
      user_id: user.id,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      report_type: "Unknown",
      status: "uploaded",
    });

    if (dbError) {
      // Roll back the storage upload if DB write fails
      await service.storage.from("credit-reports").remove([filePath]);
      console.error("[upload] db error:", dbError.message);
      return NextResponse.json(
        { error: "Failed to create report record." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, reportId, filePath });
  } catch (err) {
    console.error("[upload] unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
