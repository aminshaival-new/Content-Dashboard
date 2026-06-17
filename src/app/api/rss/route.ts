import { NextResponse } from "next/server"
import Parser from "rss-parser"
import type { CachedTrend } from "@/lib/store"

const parser = new Parser({ timeout: 8000 })

type Feed = { url: string; name: string; type: CachedTrend["sourceType"]; category: string }

const FEEDS: Feed[] = [
  { url: "https://news.ycombinator.com/rss",                            name: "Hacker News",        type: "rss",        category: "Tech" },
  { url: "https://techcrunch.com/category/artificial-intelligence/feed/",name: "TechCrunch AI",     type: "blog",       category: "AI" },
  { url: "https://www.theverge.com/rss/tech/index.xml",                  name: "The Verge",         type: "rss",        category: "Tech" },
  { url: "https://feeds.arstechnica.com/arstechnica/index",              name: "Ars Technica",      type: "blog",       category: "Tech" },
  { url: "https://www.wired.com/feed/rss",                               name: "WIRED",             type: "blog",       category: "Culture" },
]

const HOOK_KEYWORDS: Record<string, string[]> = {
  shock:    ["kill", "dead", "collapse", "secret", "nobody", "shocking", "crisis", "danger", "warning"],
  curiosity:["why", "how", "discover", "found", "reveal", "hidden", "unknown", "truth"],
  listicle: ["ways", "tips", "tricks", "steps", "things", "reasons", "mistakes"],
  story:    ["i ", "my ", "we ", "our ", "story", "journey"],
  contrast: ["vs", "instead", "not", "actually", "wrong", "myth", "but"],
}

function scoreHook(title: string): number {
  const t = title.toLowerCase()
  let score = 4
  if (HOOK_KEYWORDS.shock.some(w => t.includes(w)))    score += 2
  if (HOOK_KEYWORDS.curiosity.some(w => t.includes(w))) score += 2
  if (HOOK_KEYWORDS.listicle.some(w => t.includes(w))) score += 1
  if (HOOK_KEYWORDS.story.some(w => t.includes(w)))    score += 1
  if (HOOK_KEYWORDS.contrast.some(w => t.includes(w))) score += 1
  if (/\d/.test(title))                                  score += 1
  return Math.min(score, 10)
}

function detectTag(score: number, title: string): CachedTrend["tag"] {
  const t = title.toLowerCase()
  if (score >= 7) return "hook-potential"
  if (t.includes("explain") || t.includes("guide") || t.includes("how to") || t.includes("intro")) return "explainer"
  if (score <= 4) return "skip"
  return "explainer"
}

function buildHookAngle(title: string): string {
  const t = title.toLowerCase()
  if (HOOK_KEYWORDS.shock.some(w => t.includes(w)))
    return `Nobody is talking about what ${title.split(" ").slice(0, 5).join(" ")}... here's the truth.`
  if (HOOK_KEYWORDS.curiosity.some(w => t.includes(w)))
    return `I spent a week researching "${title}" so you don't have to.`
  return `The ${title} shift nobody prepared you for.`
}

function detectType(title: string): CachedTrend["sourceType"] {
  return "rss"
}

export async function GET() {
  const items: CachedTrend[] = []

  await Promise.allSettled(
    FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url)
        parsed.items.slice(0, 6).forEach((item, idx) => {
          const title   = item.title?.replace(/<[^>]+>/g, "").trim() ?? "Untitled"
          const summary = item.contentSnippet?.slice(0, 200).trim()
                       ?? item.content?.replace(/<[^>]+>/g, "").slice(0, 200).trim()
                       ?? ""
          const url     = item.link ?? "#"
          const pubDate = item.pubDate ?? item.isoDate ?? new Date().toISOString()
          const score   = scoreHook(title)
          const tag     = detectTag(score, title)

          items.push({
            id:          `${feed.name}-${idx}-${Date.now()}`,
            title,
            summary,
            source:      feed.name,
            sourceType:  feed.type,
            url,
            publishedAt: new Date(pubDate).toISOString(),
            tag,
            hookScore:   score,
            hookAngle:   tag === "hook-potential" ? buildHookAngle(title) : undefined,
            category:    feed.category,
          })
        })
      } catch {
        // feed failed — skip silently
      }
    })
  )

  // Sort by hook score desc, then recency
  items.sort((a, b) => {
    if (b.hookScore !== a.hookScore) return b.hookScore - a.hookScore
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })

  return NextResponse.json({ items, cachedAt: new Date().toISOString() })
}
