import { NextRequest, NextResponse } from "next/server";
import { parseResume } from "./parser";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const resume = await parseResume(buffer);

  return NextResponse.json({ resume });
}
