import Anthropic from "@anthropic-ai/sdk"
import { NextRequest, NextResponse } from "next/server"

const SECTION_PROMPTS: Record<string, string> = {
  body1: `Write the first body point for a short-form video script. 2-4 sentences expanding on the hook. Be specific, concrete, and direct. No fluff.`,
  body2: `Write the second body point. Add a proof point, example, stat, or personal experience. Keep it punchy and credible. 2-4 sentences.`,
  body3: `Write a third body point with a counterintuitive take or surprising insight. 2-3 sentences.`,
  cta: `Write the CTA (call to action). One or two short sentences asking viewers to comment, save, follow, or DM. Make it feel natural, not salesy.`,
}

// Extract the core subject/topic from the hook text
function extractTopic(hook: string): string {
  // Pick out capitalized words (likely proper nouns / key subjects), skip first word
  const words = hook.replace(/[.!?]$/g, "").split(/\s+/)
  const keyTerms = words.filter((w, i) => i > 0 && /^[A-Z]/.test(w) && w.length > 2)
  if (keyTerms.length >= 1) return keyTerms.slice(0, 3).join(" ")
  // Fallback: first 4 meaningful words
  const stopWords = new Set(["and", "the", "a", "an", "of", "in", "is", "it", "to", "no", "not"])
  const meaningful = words.filter(w => !stopWords.has(w.toLowerCase()) && w.length > 2)
  return meaningful.slice(0, 4).join(" ").toLowerCase()
}

// Smart template fallback — uses actual hook content, no generic [OPTION] placeholders
function templateFallback(hook: string): Record<string, string> {
  const topic = extractTopic(hook)
  const hookClean = hook.replace(/[.!?]$/, "")

  return {
    body1: `Most people completely miss what's actually happening here. "${hookClean}" isn't a coincidence — it's the result of a shift that's been building for years. The data is clear, and once you see it you can't unsee it.`,
    body2: `I spent the last few months tracking this closely. The pattern is consistent: the people who adapt early to ${topic} come out ahead every single time. The ones who ignore it? They're still catching up two years later.`,
    body3: `Here's the counterintuitive part — the people most affected by ${topic} are usually the ones who thought they were immune. They were the "experts." That's exactly why this hits different.`,
    cta: `If this changed how you see ${topic}, save it — you'll want to come back to this. And drop a comment: are you ahead of this or still catching up?`,
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sectionId, hook, allSections } = await req.json()
    const sections: string[] = allSections ?? (sectionId ? [sectionId] : [])
    const results: Record<string, string> = {}

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey) {
      const client = new Anthropic({ apiKey })

      for (const id of sections) {
        const instruction = SECTION_PROMPTS[id]
        if (!instruction) continue

        const msg = await client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 200,
          messages: [
            {
              role: "user",
              content: `You are writing a short-form video script section for a creator. The hook is:\n\n"${hook}"\n\nTask: ${instruction}\n\nWrite ONLY the section text. No labels, no intro, no quotes around the output. Match the tone and topic of the hook exactly.`,
            },
          ],
        })

        const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : ""
        results[id] = text
      }
    } else {
      // Smart fallback when no API key — uses hook content, not generic placeholders
      const fallback = templateFallback(hook)
      for (const id of sections) {
        if (fallback[id]) results[id] = fallback[id]
      }
    }

    return NextResponse.json({ results })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
