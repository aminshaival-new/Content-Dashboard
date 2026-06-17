import { NextRequest, NextResponse } from "next/server"

const APIFY_TOKEN = process.env.APIFY_API_TOKEN

const ACTORS: Record<string, string> = {
  Instagram: "apify~instagram-reel-scraper",
  TikTok: "clockworks~tiktok-profile-scraper",
  YouTube: "apify~instagram-reel-scraper", // fallback
  Twitter: "apify~instagram-reel-scraper",
  LinkedIn: "apify~instagram-reel-scraper",
}

export async function POST(req: NextRequest) {
  if (!APIFY_TOKEN) {
    return NextResponse.json({ error: "APIFY_API_TOKEN not configured" }, { status: 503 })
  }

  const { handle, platform, accountId } = await req.json() as {
    handle: string
    platform: string
    accountId: number
  }

  const username = handle.replace(/^@/, "")
  const actorId = ACTORS[platform] ?? ACTORS.Instagram

  const input =
    platform === "TikTok"
      ? { profiles: [`https://www.tiktok.com/@${username}`], resultsPerPage: 5 }
      : { username: [username], resultsLimit: 5 }

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs?token=${APIFY_TOKEN}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }
    )

    if (!res.ok) {
      const txt = await res.text()
      return NextResponse.json({ error: `Apify: ${txt}` }, { status: 502 })
    }

    const { data } = await res.json()
    return NextResponse.json({ runId: data.id, datasetId: data.defaultDatasetId, platform, accountId })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
