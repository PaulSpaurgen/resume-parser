import { NextResponse } from "next/server";
import { generateSuggestions } from "../llm";
import type { SuggestionsRequest, SuggestionsResponse } from "../../(resume)/types/api";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SuggestionsRequest;
    const suggestions = await generateSuggestions(payload.resume);
    const response: SuggestionsResponse = { suggestions };
    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Failed to generate suggestions." },
      { status: 500 },
    );
  }
}
