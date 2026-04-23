import { NextRequest, NextResponse } from "next/server";
import { parseResume } from "./parser";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const resume = await parseResume(buffer);

    return NextResponse.json({ resume });
  } catch {
    return NextResponse.json({ error: "Failed to parse resume." }, { status: 500 });
  }
}
