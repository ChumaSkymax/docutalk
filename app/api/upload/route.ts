import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@clerk/nextjs/server";
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_PDF_TYPES,
  MAX_FILE_SIZE,
} from "@/lib/constants";

const ALLOWED_MIME_TYPES = new Set<string>([
  ...ACCEPTED_PDF_TYPES,
  ...ACCEPTED_IMAGE_TYPES,
]);

const EXTENSION_TO_MIME: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const filename = formData.get("filename") as string | null;

    if (!file || !filename) {
      return NextResponse.json(
        { error: "Missing file or filename" },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 413 });
    }

    let resolvedType = file.type;
    if (!resolvedType) {
      const ext = filename.split(".").pop()?.toLowerCase() ?? "";
      resolvedType = EXTENSION_TO_MIME[ext] ?? "";
    }

    if (!ALLOWED_MIME_TYPES.has(resolvedType)) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 415 },
      );
    }

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: resolvedType,
      token: process.env.DOCUTALK_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (e) {
    console.error("Upload error", e);
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
