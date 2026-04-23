import type { Resume } from "../../(resume)/types/resume";

interface OpenAIResumeExperience {
  title: string;
  company: string;
  duration: string;
  summary: string;
}

interface OpenAIResume {
  name: string;
  headline: string;
  skills: string[];
  experience: OpenAIResumeExperience[];
}

interface PDFParseInstance {
  getText: () => Promise<{ text: string }>;
  destroy: () => Promise<void>;
}

export async function parseResume(fileBuffer: Buffer): Promise<Resume> {
  const [{ CanvasFactory }, { PDFParse }] = await Promise.all([
    import("pdf-parse/worker"),
    import("pdf-parse"),
  ]);
  let parser: PDFParseInstance | null = null;

  try {
    parser = new PDFParse({
      data: fileBuffer,
      CanvasFactory,
    }) as PDFParseInstance;

    const data = await parser.getText();
    const rawText = data.text;
    return await buildStructuredResume(rawText);
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw error;
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
}

async function buildStructuredResume(rawText: string): Promise<Resume> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return buildFallbackResume(rawText);
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "resume_schema",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              name: { type: "string" },
              headline: { type: "string" },
              skills: {
                type: "array",
                items: { type: "string" },
              },
              experience: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    title: { type: "string" },
                    company: { type: "string" },
                    duration: { type: "string" },
                    summary: { type: "string" },
                  },
                  required: ["title", "company", "duration", "summary"],
                },
              },
            },
            required: ["name", "headline", "skills", "experience"],
          },
        },
      },
      messages: [
        {
          role: "system",
          content:
            "Extract resume data into the exact schema. Keep unknown fields as empty strings or empty arrays.",
        },
        {
          role: "user",
          content: `Resume text:\n\n${rawText}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("OpenAI extraction failed:", details);
    return buildFallbackResume(rawText);
  }

  const completion = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = completion.choices?.[0]?.message?.content;
  if (!content) {
    return buildFallbackResume(rawText);
  }

  try {
    const parsed = JSON.parse(content) as OpenAIResume;
    return normalizeResume(parsed);
  } catch {
    return buildFallbackResume(rawText);
  }
}

function normalizeResume(input: OpenAIResume): Resume {
  return {
    name: typeof input.name === "string" ? input.name : "",
    headline: typeof input.headline === "string" ? input.headline : "",
    skills: Array.isArray(input.skills) ? input.skills.filter((item) => typeof item === "string") : [],
    experience: Array.isArray(input.experience)
      ? input.experience
          .filter(
            (item) =>
              item &&
              typeof item.title === "string" &&
              typeof item.company === "string" &&
              typeof item.duration === "string" &&
              typeof item.summary === "string",
          )
          .map((item) => ({
            id: crypto.randomUUID(),
            title: item.title,
            company: item.company,
            duration: item.duration,
            summary: item.summary,
          }))
      : [],
  };
}

function buildFallbackResume(text: string): Resume {
  const sectionTitles = ["experience", "education", "skills", "projects"];

  const lines = text.split("\n");

  const sections: { title: string; content: string }[] = [];

  let currentSection: { title: string; content: string[] } | null = null;

  for (const line of lines) {
    const lower = line.toLowerCase();

    const found = sectionTitles.find((title) => lower.includes(title));

    if (found) {
      if (currentSection) {
        sections.push({
          title: currentSection.title,
          content: currentSection.content.join(" "),
        });
      }

      currentSection = {
        title: found,
        content: [],
      };
    } else if (currentSection) {
      currentSection.content.push(line);
    }
  }

  if (currentSection) {
    sections.push({
      title: currentSection.title,
      content: currentSection.content.join(" "),
    });
  }

  const skillsSection = sections.find((section) => section.title === "skills")?.content ?? "";
  const experienceSection = sections.find((section) => section.title === "experience")?.content ?? "";

  const skills = skillsSection
    .split(/[,|•\n]/)
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 20);

  return {
    name: "Unknown Candidate",
    headline: "Resume parsed from uploaded PDF",
    skills,
    experience: experienceSection
      ? [
          {
            id: crypto.randomUUID(),
            title: "Previous Role",
            company: "Unknown Company",
            duration: "Not specified",
            summary: experienceSection.slice(0, 500),
          },
        ]
      : [],
  };
}
