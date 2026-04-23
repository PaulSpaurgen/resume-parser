import type { ChatMessage } from "../(resume)/types/chat";
import type { Resume } from "../(resume)/types/resume";
import type { Suggestion } from "../(resume)/types/suggestion";

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function summarizeResumeEvidence(resume: Resume): { headline: string; citations: string[] } {
  const topExperience = resume.experience.slice(0, 2);
  const topSkills = resume.skills.slice(0, 4);
  const citations = topExperience.map(
    (item) => `${item.title} | ${item.company} | ${item.duration}`,
  );
  const headlineParts = [
    resume.headline ? `Headline: ${resume.headline}` : "",
    topSkills.length > 0 ? `Skills: ${topSkills.join(", ")}` : "",
  ].filter(Boolean);

  return {
    headline:
      headlineParts.length > 0
        ? headlineParts.join(" | ")
        : "Resume includes limited structured detail.",
    citations,
  };
}

function buildGroundedFallbackChat(message: string, resume: Resume): ChatMessage {
  const evidence = summarizeResumeEvidence(resume);
  const content =
    `I can answer this using only the uploaded resume. For "${message}", the strongest evidence available is: ${evidence.headline}. ` +
    "If you need a deeper answer, ask about a specific role, date range, or skill shown in the resume.";

  return {
    id: createId("assistant"),
    role: "assistant",
    content,
    createdAt: new Date().toISOString(),
    citations: evidence.citations.slice(0, 2).map((label, index) => ({
      id: `cite-${index + 1}`,
      label,
    })),
  };
}

export async function generateChatReply(message: string, resume: Resume, history: ChatMessage[]): Promise<ChatMessage> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return buildGroundedFallbackChat(message, resume);
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
    return buildGroundedFallbackChat(message, resume);
  }

  const completion = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = completion.choices?.[0]?.message?.content;
  if (!content) {
    return buildGroundedFallbackChat(message, resume);
  }

  try {
    const parsed = JSON.parse(content) as { content?: string; citations?: string[] };
    if (!parsed.content || typeof parsed.content !== "string") {
      return buildGroundedFallbackChat(message, resume);
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
    return buildGroundedFallbackChat(message, resume);
  }
}

interface OpenAISuggestionsPayload {
  suggestions: string[];
}

function buildGroundedFallbackSuggestions(resume: Resume): Suggestion[] {
  const latestRole = resume.experience[0]?.title ?? "the latest role";
  const longestRole = resume.experience.at(-1)?.title ?? "their previous roles";
  const topSkill = resume.skills[0] ?? "their listed skills";

  const questions = [
    `What evidence in ${latestRole} suggests readiness for this role?`,
    `Which accomplishments in ${longestRole} indicate sustained impact over time?`,
    `How strong is the depth in ${topSkill} based on resume evidence?`,
    "What important gaps or unclear areas should be validated in interview?",
  ];

  return questions.map((question) => ({
    id: createId("sugg"),
    question,
  }));
}

export async function generateSuggestions(resume: Resume): Promise<Suggestion[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return buildGroundedFallbackSuggestions(resume);
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
    return buildGroundedFallbackSuggestions(resume);
  }

  const completion = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = completion.choices?.[0]?.message?.content;
  if (!content) {
    return buildGroundedFallbackSuggestions(resume);
  }

  try {
    const parsed = JSON.parse(content) as OpenAISuggestionsPayload;
    if (!Array.isArray(parsed.suggestions) || parsed.suggestions.length === 0) {
      return buildGroundedFallbackSuggestions(resume);
    }

    const sanitized = parsed.suggestions
      .map((question) => question.trim())
      .filter(Boolean)
      .filter((question) => !/\b(you|your|yours)\b/i.test(question))
      .slice(0, 6);

    if (sanitized.length === 0) {
      return buildGroundedFallbackSuggestions(resume);
    }

    return sanitized.map((question) => ({
      id: createId("sugg"),
      question,
    }));
  } catch {
    return buildGroundedFallbackSuggestions(resume);
  }
}
