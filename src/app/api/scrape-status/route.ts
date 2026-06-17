import { NextRequest, NextResponse } from "next/server"

const APIFY_TOKEN = process.env.APIFY_API_TOKEN

function fmtViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return String(n)
}

function detectHookType(text: string): string {
  const t = text.toLowerCase()
  if (/\d+\s+(things|ways|tips|reasons|steps|secrets|mistakes|rules|facts|habits)/i.test(t)) return "Listicle"
  if (/\?/.test(t) && /(how|what|why|when|who|which|can|should|will|do|does|is|are)/i.test(t)) return "Question"
  if (/(nobody|no one|most people|uncomfortable truth|shocking|they don't|truth about|biggest lie|myth)/i.test(t)) return "Shock"
  if (/(i was|i went|i built|i made|i spent|i lost|i quit|i turned|here's my|my story)/i.test(t)) return "Story"
  if (/(but|instead|stop|vs\.?|versus|beats|better than|worse than|not.*—|however)/i.test(t)) return "Contrast"
  if (/(secret|hidden|most people don't|nobody talks|underrated|rarely|under-the-radar|the real reason)/i.test(t)) return "Curiosity"
  if (/^pov[:\s]/i.test(t)) return "POV"
  return "Shock"
}

function firstSentences(text: string, n = 2): string {
  return text.split(/(?<=[.!?])\s+/).filter(s => s.trim()).slice(0, n).join(" ").trim()
}

function mapInstagram(item: Record<string, unknown>, accountId: number) {
  const caption = (item.caption as string) ?? ""
  const hook = firstSentences(caption) || caption.slice(0, 150) || "Watch this reel"
  const views = (item.videoViewCount as number) ?? (item.viewsCount as number) ?? 0
  const ts = item.timestamp as string
  const date = ts
    ? new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const tags = ((item.hashtags as string[]) ?? []).slice(0, 3).map(h => `#${h}`).join(" ")
  const onScreen = tags || hook.replace(/['"]/g, "").toUpperCase().slice(0, 50)

  return { accountId, views, viewsLabel: fmtViews(views), postedDate: date, hookType: detectHookType(hook), hook, onScreenText: onScreen, transcript: caption.slice(0, 300) || hook }
}

function mapTikTok(item: Record<string, unknown>, accountId: number) {
  const desc = (item.text as string) ?? (item.desc as string) ?? ""
  const hook = firstSentences(desc) || desc.slice(0, 150) || "Watch this video"
  const stats = (item.stats as Record<string, number>) ?? {}
  const views = stats.playCount ?? (item.playCount as number) ?? 0
  const createTime = item.createTime as number
  const date = createTime
    ? new Date(createTime * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })
  const rawTags = (item.hashtags as Array<{ name: string }>) ?? []
  const tags = rawTags.slice(0, 3).map(h => `#${h.name}`).join(" ")
  const onScreen = tags || hook.replace(/['"]/g, "").toUpperCase().slice(0, 50)

  return { accountId, views, viewsLabel: fmtViews(views), postedDate: date, hookType: detectHookType(hook), hook, onScreenText: onScreen, transcript: desc.slice(0, 300) || hook }
}

export async function GET(req: NextRequest) {
  if (!APIFY_TOKEN) {
    return NextResponse.json({ error: "APIFY_API_TOKEN not configured" }, { status: 503 })
  }

  const { searchParams } = new URL(req.url)
  const runId = searchParams.get("runId")
  const accountId = Number(searchParams.get("accountId"))
  const platform = searchParams.get("platform") ?? "Instagram"

  if (!runId) return NextResponse.json({ error: "Missing runId" }, { status: 400 })

  try {
    const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`)
    const { data } = await statusRes.json()
    const status: string = data?.status ?? "UNKNOWN"

    if (status === "SUCCEEDED") {
      const itemsRes = await fetch(
        `https://api.apify.com/v2/datasets/${data.defaultDatasetId}/items?token=${APIFY_TOKEN}&limit=10`
      )
      const items: Record<string, unknown>[] = await itemsRes.json()
      const reels = (Array.isArray(items) ? items : []).map(item =>
        platform === "TikTok" ? mapTikTok(item, accountId) : mapInstagram(item, accountId)
      )
      return NextResponse.json({ status: "done", reels })
    }

    if (["FAILED", "ABORTED", "TIMED-OUT"].includes(status)) {
      return NextResponse.json({ status: "failed", error: `Run ${status}` })
    }

    return NextResponse.json({ status: "running" })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
