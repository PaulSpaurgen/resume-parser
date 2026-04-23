import { NextResponse } from "next/server";
import { generateChatReply } from "../llm";
import type { ChatRequest, ChatResponse } from "../../(resume)/types/api";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ChatRequest;
    const reply = await generateChatReply( payload.message, payload.resume, payload.history);
    const response: ChatResponse = { reply };
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Failed to generate chat reply." }, { status: 500 });
  }
}
