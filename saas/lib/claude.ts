import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-7";

export async function generate(opts: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 2048,
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
  });
  return msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}
