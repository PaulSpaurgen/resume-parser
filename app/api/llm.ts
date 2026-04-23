import type { ChatMessage } from "../(resume)/types/chat";
import type { Resume } from "../(resume)/types/resume";
import type { Suggestion } from "../(resume)/types/suggestion";

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export async function generateChatReplyMock(
  message: string,
  history: ChatMessage[],
): Promise<ChatMessage> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const turns = history.length + 1;
  const content = `Based on the resume, this candidate shows strong frontend ownership and measurable impact. For your question "${message}", I would focus on their App Router migration and mentoring outcomes.`;

  return {
    id: createId("assistant"),
    role: "assistant",
    content: `${content} (Turn ${turns})`,
    createdAt: new Date().toISOString(),
    citations: [
      { id: "cite-1", label: "Nova Labs | Senior Frontend Engineer | 2021 - Present" },
    ],
  };
}

export async function generateChatReply(message: string, resume: Resume, history: ChatMessage[]): Promise<ChatMessage> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return generateChatReplyMock(message, history);
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "chat_reply_schema",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              content: { type: "string" },
              citations: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["content", "citations"],
          },
        },
      },
      messages: [
        {
          role: "system",
          content:
            "You are an interview copilot helping a recruiter evaluate a candidate based on resume evidence. Answer clearly in 2-4 sentences, grounded in the provided resume. Do not invent facts. Keep citations short and specific as role/company snippets from the resume.",
        },
        {
          role: "user",
          content: `Resume JSON:\n${JSON.stringify(resume)}`,
        },
        ...history.map((item) => ({
          role: item.role,
          content: item.content,
        })),
        {
          role: "user",
          content: message,
        },
      ],
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("OpenAI chat failed:", details);
    return generateChatReplyMock(message, history);
  }

  const completion = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = completion.choices?.[0]?.message?.content;
  if (!content) {
    return generateChatReplyMock(message, history);
  }

  try {
    const parsed = JSON.parse(content) as { content?: string; citations?: string[] };
    if (!parsed.content || typeof parsed.content !== "string") {
      return generateChatReplyMock(message, history);
    }

    const citations =
      Array.isArray(parsed.citations) && parsed.citations.length > 0
        ? parsed.citations.filter((item) => typeof item === "string" && item.trim().length > 0).slice(0, 3)
        : [];

    return {
      id: createId("assistant"),
      role: "assistant",
      content: parsed.content.trim(),
      createdAt: new Date().toISOString(),
      citations: citations.map((label, index) => ({
        id: `cite-${index + 1}`,
        label,
      })),
    };
  } catch {
    return generateChatReplyMock(message, history);
  }
}

export async function generateSuggestionsMock(resume: Resume): Promise<Suggestion[]> {
  await new Promise((resolve) => setTimeout(resolve, 700));

  const latestRole = resume.experience[0]?.title ?? "this candidate";
  const coreSkill = resume.skills[0] ?? "core skills";

  return [
    {
      id: createId("sugg"),
      question: `What evidence in the resume indicates leadership impact in the ${latestRole} role?`,
    },
    {
      id: createId("sugg"),
      question: `How strongly does the resume demonstrate depth in ${coreSkill} for this hiring need?`,
    },
    {
      id: createId("sugg"),
      question: "Which resume bullets best support senior-level ownership and delivery?",
    },
    {
      id: createId("sugg"),
      question: "What gaps or unclear areas in the resume should the recruiter validate in interview?",
    },
  ];
}

interface OpenAISuggestionsPayload {
  suggestions: string[];
}

export async function generateSuggestions(resume: Resume): Promise<Suggestion[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return generateSuggestionsMock(resume);
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "suggestions_schema",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              suggestions: {
                type: "array",
                minItems: 4,
                maxItems: 6,
                items: { type: "string" },
              },
            },
            required: ["suggestions"],
          },
        },
      },
      messages: [
        {
          role: "system",
          content:
            "You are helping an interviewer get quick questions ABOUT the candidate's resume. Write recruiter-facing questions in third person only. Do not address the candidate directly. Do not use second-person wording like 'you' or 'your'. Focus on evidence, gaps, impact, role fit, and credibility visible in the resume. Return only valid JSON matching schema.",
        },
        {
          role: "user",
          content: JSON.stringify(resume),
        },
      ],
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("OpenAI suggestions failed:", details);
    return generateSuggestionsMock(resume);
  }

  const completion = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = completion.choices?.[0]?.message?.content;
  if (!content) {
    return generateSuggestionsMock(resume);
  }

  try {
    const parsed = JSON.parse(content) as OpenAISuggestionsPayload;
    if (!Array.isArray(parsed.suggestions) || parsed.suggestions.length === 0) {
      return generateSuggestionsMock(resume);
    }

    const sanitized = parsed.suggestions
      .map((question) => question.trim())
      .filter(Boolean)
      .filter((question) => !/\b(you|your|yours)\b/i.test(question))
      .slice(0, 6);

    if (sanitized.length === 0) {
      return generateSuggestionsMock(resume);
    }

    return sanitized.map((question) => ({
      id: createId("sugg"),
      question,
    }));
  } catch {
    return generateSuggestionsMock(resume);
  }
}
