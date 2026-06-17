"use client"

import { useState, useMemo, useEffect } from "react"
import {
  TrendingUp, RefreshCw, BookMarked, Check, Send, Clock,
  Globe, Hash, Rss, Mail, Zap, Bell, ChevronDown, AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { hooksStore, trendingStore, type CachedTrend } from "@/lib/store"

// ─── Types ────────────────────────────────────────────────────────────────────

type Tag = "hook-potential" | "explainer" | "skip"
type SourceType = "blog" | "x" | "rss" | "newsletter"

type Source = {
  id: string
  name: string
  type: SourceType
  lastSynced: number   // minutes ago
  status: "fresh" | "stale" | "error"
}

type TrendItem = {
  id: string
  sourceId: string
  title: string
  summary: string
  minsAgo: number
  tag: Tag
  hookScore: number    // 0–10
  hookAngle?: string   // suggested hook for hook-potential items
  category: string
}

// ─── Sources ──────────────────────────────────────────────────────────────────

const SOURCES: Source[] = [
  { id: "anthropic",     name: "Anthropic Blog",          type: "blog",       lastSynced: 18,   status: "fresh" },
  { id: "openai",        name: "OpenAI Blog",             type: "blog",       lastSynced: 18,   status: "fresh" },
  { id: "deepmind",      name: "DeepMind Blog",           type: "blog",       lastSynced: 25,   status: "fresh" },
  { id: "hn",            name: "Hacker News",             type: "rss",        lastSynced: 6,    status: "fresh" },
  { id: "techcrunch",    name: "TechCrunch AI",           type: "rss",        lastSynced: 14,   status: "fresh" },
  { id: "rundown",       name: "The Rundown AI",          type: "newsletter", lastSynced: 38,   status: "fresh" },
  { id: "tldr",          name: "TLDR Tech",               type: "newsletter", lastSynced: 42,   status: "fresh" },
  { id: "bensbites",     name: "Ben's Bites",             type: "newsletter", lastSynced: 47,   status: "fresh" },
  { id: "x-creator",    name: "X · Creator Economy",     type: "x",          lastSynced: 9,    status: "fresh" },
  { id: "x-ai",         name: "X · AI & Tech",           type: "x",          lastSynced: 9,    status: "fresh" },
  { id: "creator-rep",  name: "Creator Economy Report",  type: "rss",        lastSynced: 190,  status: "stale" },
  { id: "morning-brew", name: "Morning Brew Tech",       type: "newsletter", lastSynced: 63,   status: "fresh" },
]

const SOURCE_MAP = Object.fromEntries(SOURCES.map(s => [s.id, s]))

// ─── Feed data ────────────────────────────────────────────────────────────────

const ITEMS: TrendItem[] = [
  {
    id: "1", sourceId: "openai", minsAgo: 92, tag: "hook-potential", hookScore: 10, category: "AI Tools",
    title: "OpenAI's new voice mode can replicate any creator's style in real-time",
    summary: "New API endpoint clones a creator's vocal pattern and delivery with under 10 seconds of reference audio. Currently in closed beta for verified Creator Partner accounts — full rollout in Q3.",
    hookAngle: "OpenAI just released something that changes creator forever — and nobody's talking about what this actually means for YOUR brand voice...",
  },
  {
    id: "2", sourceId: "anthropic", minsAgo: 138, tag: "hook-potential", hookScore: 9, category: "AI Tools",
    title: "Anthropic releases Claude Opus 4.8 — context window triples to 600K tokens",
    summary: "600K context enables full-book analysis, multi-session creative projects, and generating a month of content in a single session without losing thread. Pricing unchanged from Opus 4.6.",
    hookAngle: "The context window just tripled. Here's why that changes how I create an entire month of content in a single session...",
  },
  {
    id: "3", sourceId: "x-creator", minsAgo: 167, tag: "hook-potential", hookScore: 9, category: "Platform Changes",
    title: "Instagram algorithm update: Reels penalized for hashtag stuffing (30+ tags)",
    summary: "Multiple creators reporting –60% reach after posting with 30+ hashtags. Internal doc leaked via X confirms shift to semantic topic clustering over explicit tag matching.",
    hookAngle: "Stop using 30 hashtags on your Reels. Instagram just quietly killed that strategy — here's what actually works now...",
  },
  {
    id: "4", sourceId: "morning-brew", minsAgo: 243, tag: "hook-potential", hookScore: 9, category: "Creator Economy",
    title: "Brands shifting $2B ad spend from influencers to AI-generated content in 2026",
    summary: "Morning Brew research: brands allocating 34% of influencer budgets to AI content studios. 3 major campaigns delivered 2× ROI at 60% lower cost, accelerating the shift.",
    hookAngle: "Brands just moved $2 billion away from human creators. Here's what it means if you don't adapt your content strategy this year...",
  },
  {
    id: "5", sourceId: "x-ai", minsAgo: 287, tag: "hook-potential", hookScore: 8, category: "Monetization",
    title: "TikTok's new creator fund pays 3× more for videos over 90s with 70%+ completion",
    summary: "Q2 2026 fund restructure rewards longer content with sustained attention. 90-second videos with 70%+ completion earn $0.14/1K views vs. $0.05 average.",
    hookAngle: "TikTok just changed how creators get paid. Here's the exact format that 3×'s your creator fund earnings...",
  },
  {
    id: "6", sourceId: "deepmind", minsAgo: 312, tag: "hook-potential", hookScore: 8, category: "AI Tools",
    title: "Google DeepMind's Veo 3 generates full 60-second scripts from a one-line brief",
    summary: "Demo shows the model producing hook, 3-point body, and CTA from a 10-word prompt. Script quality benchmarks at 78th percentile vs. human-written viral content on same topics.",
    hookAngle: "Google's AI just wrote a better script than 78% of human creators. Here's how I'm using it instead of fighting it...",
  },
  {
    id: "7", sourceId: "x-creator", minsAgo: 364, tag: "hook-potential", hookScore: 8, category: "Platform Changes",
    title: "Meta's Caption AI auto-generates captions and hashtags ranked by predicted engagement",
    summary: "Rolling out across Instagram and Facebook — generates 3 caption options scored by predicted engagement. Opt-in now, likely default by Q3 2026.",
    hookAngle: "Meta just automated the part that takes creators the longest. Here's what it means for the hook game...",
  },
  {
    id: "8", sourceId: "openai", minsAgo: 423, tag: "hook-potential", hookScore: 7, category: "AI Tools",
    title: "Sam Altman at Creator Summit: 'Every creator will have an AI twin by end of 2026'",
    summary: "Altman demoed a full AI version of a creator that posted, responded to DMs, and ran a live Q&A — all without the creator present. The AI twin knew the creator's brand voice and answered in their style.",
    hookAngle: "Sam Altman just showed a creator's AI clone run a live Q&A without the creator. Here's the part nobody's asking about...",
  },
  {
    id: "9", sourceId: "morning-brew", minsAgo: 481, tag: "hook-potential", hookScore: 7, category: "Creator Economy",
    title: "Creator economy hits $500B — but 90% went to the top 1% of creators",
    summary: "Goldman Sachs report: Gini coefficient of 0.91 — more concentrated than hedge fund compensation. Top 100 creators earned more than the bottom 47 million combined.",
    hookAngle: "The creator economy just hit $500B. But 90% of it went to 1% of creators. Here's what side you want to be on...",
  },
  {
    id: "10", sourceId: "hn", minsAgo: 542, tag: "hook-potential", hookScore: 7, category: "Platform Changes",
    title: "LinkedIn's algorithm now prioritizes video — text post reach drops 38–43%",
    summary: "HN thread citing data across 1K creator accounts: LinkedIn's Q2 update heavily weighted short video. Text post reach dropped 38–43% on average.",
    hookAngle: "LinkedIn just killed text posts. Here's the exact format winning right now if you want B2B reach...",
  },
  {
    id: "11", sourceId: "rundown", minsAgo: 601, tag: "explainer", hookScore: 6, category: "Workflow",
    title: "How to use AI to repurpose one video into 30 pieces of content (step-by-step)",
    summary: "Prompt chains for Claude, Gemini, and GPT-4o that take a single transcript and output shorts scripts, carousel slides, thread posts, and email newsletters in one session.",
  },
  {
    id: "12", sourceId: "techcrunch", minsAgo: 663, tag: "explainer", hookScore: 5, category: "Platform Data",
    title: "YouTube Shorts outperforms Reels for follower conversion in Q2 2026 — Dash Hudson",
    summary: "Shorts viewers 2.3× more likely to convert to subscribers vs. Reels viewers. Attribution difference linked to YouTube's stronger recommendation engine.",
  },
  {
    id: "13", sourceId: "bensbites", minsAgo: 721, tag: "explainer", hookScore: 5, category: "AI Tools",
    title: "The 10 AI tools every content creator is actually using right now",
    summary: "Survey of 2,400 creators: Claude for scripting (68%), Midjourney for thumbnails (54%), ElevenLabs for voiceover (41%), CapCut AI for editing (39%). Full breakdown with use cases per platform.",
  },
  {
    id: "14", sourceId: "tldr", minsAgo: 782, tag: "explainer", hookScore: 4, category: "Platform Changes",
    title: "Spotify's new Video Clips format competes directly with YouTube Shorts",
    summary: "Vertical short-form previews up to 90 seconds attached to podcast episodes. Available to Spotify for Podcasters users with 1K+ followers starting June 30.",
  },
  {
    id: "15", sourceId: "x-ai", minsAgo: 843, tag: "explainer", hookScore: 4, category: "Industry",
    title: "Stability AI acquires Runway — combined company valued at $3B",
    summary: "Stock and cash deal creates the largest AI video generation company outside major labs. Runway API customers migrate to Stability infrastructure over Q3.",
  },
  {
    id: "16", sourceId: "creator-rep", minsAgo: 961, tag: "skip", hookScore: 2, category: "Business",
    title: "Substack grows 40%, Patreon revenue flat in Q1 2026",
    summary: "Substack MRR up 41% YoY driven by Notes feature. Patreon monthly revenue flat at $2.1B processed, churn up to 8.4% from 6.7%.",
  },
  {
    id: "17", sourceId: "anthropic", minsAgo: 1021, tag: "skip", hookScore: 1, category: "Policy",
    title: "Anthropic publishes updated Responsible Scaling Policy v3",
    summary: "RSP v3 details new evaluation thresholds for model capabilities and deployment restrictions at ASL-3 and above. Applies to all Claude model versions.",
  },
  {
    id: "18", sourceId: "hn", minsAgo: 1082, tag: "skip", hookScore: 1, category: "Tools",
    title: "Ask HN: What's your RSS reader setup in 2026?",
    summary: "Community thread on modern RSS workflows. Top answers: Reeder 5, Feedbin, and self-hosted FreshRSS with AI filtering plugins for noise reduction.",
  },
  {
    id: "19", sourceId: "deepmind", minsAgo: 1143, tag: "skip", hookScore: 1, category: "Research",
    title: "DeepMind releases AlphaProof v2 technical report",
    summary: "Updated mathematical reasoning model achieves 94.2% on MATH benchmark. Architecture improvements include Monte Carlo tree search with symbolic solver integration.",
  },
  {
    id: "20", sourceId: "tldr", minsAgo: 1204, tag: "skip", hookScore: 2, category: "Funding",
    title: "TLDR: OpenAI, Perplexity, and Cohere all close funding rounds this week",
    summary: "OpenAI $2B secondary at $300B valuation. Perplexity $500M Series D. Cohere $250M targeting enterprise search. A busy week for AI fundraising.",
  },
]

// ─── Constants ────────────────────────────────────────────────────────────────

const TAG_META: Record<Tag, { label: string; class: string; dot: string }> = {
  "hook-potential": { label: "Hook Worthy", class: "bg-violet-500/15 text-violet-300 border-violet-500/20", dot: "bg-violet-400" },
  "explainer":      { label: "Explainer",   class: "bg-blue-500/15 text-blue-300 border-blue-500/20",       dot: "bg-blue-400" },
  "skip":           { label: "Skip",        class: "bg-gray-500/15 text-gray-500 border-gray-500/20",        dot: "bg-gray-600" },
}

const SOURCE_TYPE_ICON: Record<SourceType, React.ElementType> = {
  blog: Globe, x: Hash, rss: Rss, newsletter: Mail,
}

const SCORE_COLOR = (s: number) =>
  s >= 9 ? "text-orange-300 bg-orange-500/15 border-orange-500/20"
  : s >= 7 ? "text-violet-300 bg-violet-500/15 border-violet-500/20"
  : s >= 5 ? "text-blue-300 bg-blue-500/15 border-blue-500/20"
  : "text-gray-500 bg-gray-500/10 border-gray-500/15"

const CATEGORIES = ["All", "AI Tools", "Platform Changes", "Creator Economy", "Monetization", "Workflow", "Industry"]

// ─── Slack integration stub ───────────────────────────────────────────────────
// Replace body with: POST to your Slack incoming webhook URL, or
// mcp__Slack__post_message({ channel: "#content-highlights", text: buildDigestText(items) })

async function sendSlackDigest(items: TrendItem[]): Promise<{ success: boolean }> {
  await new Promise(r => setTimeout(r, 900 + Math.random() * 400))
  console.log("[Slack] digest sent with", items.length, "items")
  return { success: true }
}

function buildDigestText(items: TrendItem[]): string {
  const date = new Date(2026, 5, 16).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  })
  const header = `📊 *Trending Brief* — ${date} · 7:00 AM\n\n*Top ${items.length} hook-worthy items today:*\n`
  const body = items.map((item, i) => {
    const src = SOURCE_MAP[item.sourceId]?.name ?? item.sourceId
    const lines = [`${i + 1}. *${item.title}*`]
    if (item.hookAngle) lines.push(`   → _${item.hookAngle}_`)
    lines.push(`   ${src} · ${timeAgo(item.minsAgo)}`)
    return lines.join("\n")
  }).join("\n\n")
  return `${header}\n${body}`
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(mins: number): string {
  if (mins < 60) return `${mins}m ago`
  const h = Math.floor(mins / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ─── Source strip ─────────────────────────────────────────────────────────────

function SourceStrip({ refreshing, onRefresh }: { refreshing: boolean; onRefresh: () => void }) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-gray-600 uppercase tracking-wider font-semibold">
          12 sources · last synced
        </span>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className={cn(
            "flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-white transition-colors",
            refreshing && "opacity-50 cursor-not-allowed"
          )}
        >
          <RefreshCw className={cn("w-3 h-3", refreshing && "animate-spin")} />
          {refreshing ? "Pulling feeds..." : "Refresh all"}
        </button>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {SOURCES.map(src => {
          const Icon = SOURCE_TYPE_ICON[src.type]
          const dotColor = src.status === "fresh" ? "bg-emerald-400"
            : src.status === "stale" ? "bg-yellow-400"
            : "bg-red-400"
          return (
            <div
              key={src.id}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#111119] border border-[#1f1f2e] text-[11px] text-gray-500"
            >
              <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotColor)} />
              <Icon className="w-3 h-3 text-gray-600 flex-shrink-0" />
              <span className="text-gray-400 truncate max-w-[90px]">{src.name}</span>
              <span className="text-gray-700 flex-shrink-0">{timeAgo(src.lastSynced)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Top pick card ────────────────────────────────────────────────────────────

function TopPickCard({
  item, rank, onSave, saved,
}: {
  item: TrendItem
  rank: number
  onSave: (item: TrendItem) => void
  saved: boolean
}) {
  const src = SOURCE_MAP[item.sourceId]

  return (
    <div className={cn(
      "bg-[#111119] border rounded-2xl p-4 transition-all",
      rank === 1
        ? "border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-transparent"
        : "border-violet-500/20 bg-violet-500/5"
    )}>
      <div className="flex items-start gap-3">
        {/* Rank */}
        <div className={cn(
          "w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0",
          rank === 1
            ? "bg-orange-500/20 text-orange-300"
            : "bg-violet-500/15 text-violet-400"
        )}>
          {rank}
        </div>

        <div className="flex-1 min-w-0">
          {/* Meta */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {src && (
              <span className="text-[11px] font-medium text-gray-400">
                {src.name}
              </span>
            )}
            <span className="text-[11px] text-gray-600">{timeAgo(item.minsAgo)}</span>
            <span className={cn(
              "ml-auto flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border",
              SCORE_COLOR(item.hookScore)
            )}>
              <Zap className="w-2.5 h-2.5" />
              {item.hookScore}/10
            </span>
          </div>

          {/* Title */}
          <p className="text-sm font-semibold text-white leading-snug mb-2">{item.title}</p>

          {/* Hook angle */}
          {item.hookAngle && (
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-3 py-2 mb-2.5">
              <p className="text-[11px] text-gray-500 mb-0.5 uppercase tracking-wider font-semibold">
                Suggested hook
              </p>
              <p className="text-xs text-violet-300 font-mono leading-relaxed italic">
                "{item.hookAngle}"
              </p>
            </div>
          )}

          {/* Action */}
          <button
            onClick={() => onSave(item)}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all",
              saved
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
                : "bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/15"
            )}
          >
            {saved ? <Check className="w-3 h-3" /> : <BookMarked className="w-3 h-3" />}
            {saved ? "Saved to Vault" : "Save to Hook Vault"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Feed item card ───────────────────────────────────────────────────────────

function FeedCard({
  item, onSave, saved,
}: {
  item: TrendItem
  onSave: (item: TrendItem) => void
  saved: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const src = SOURCE_MAP[item.sourceId]
  const tag = TAG_META[item.tag]

  return (
    <div className={cn(
      "bg-[#111119] border rounded-2xl transition-all",
      item.tag === "hook-potential"
        ? "border-[#1f1f2e] hover:border-violet-500/25"
        : "border-[#1a1a2a] hover:border-[#1f1f2e]"
    )}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Meta row */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={cn(
                "text-[11px] font-medium px-1.5 py-0.5 rounded-md border",
                tag.class
              )}>
                <span className={cn("inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle", tag.dot)} />
                {tag.label}
              </span>
              {src && <span className="text-[11px] text-gray-500">{src.name}</span>}
              <span className="text-[11px] text-gray-600">{timeAgo(item.minsAgo)}</span>
              <span className="text-[11px] text-gray-700">{item.category}</span>

              {item.tag !== "skip" && (
                <span className={cn(
                  "ml-auto flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border",
                  SCORE_COLOR(item.hookScore)
                )}>
                  <Zap className="w-2 h-2" />
                  {item.hookScore}
                </span>
              )}
            </div>

            {/* Title */}
            <p className={cn(
              "text-sm font-medium leading-snug mb-1.5",
              item.tag === "skip" ? "text-gray-500" : "text-gray-200"
            )}>
              {item.title}
            </p>

            {/* Summary (collapsed for skip) */}
            {item.tag !== "skip" && (
              <p className="text-xs text-gray-500 leading-relaxed mb-2.5">{item.summary}</p>
            )}

            {/* Hook angle */}
            {item.hookAngle && item.tag === "hook-potential" && (
              <div className="bg-violet-500/8 border border-violet-500/15 rounded-xl px-3 py-2 mb-2.5">
                <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5 font-semibold">Hook angle</p>
                <p className="text-[11px] text-violet-300 font-mono leading-relaxed italic">
                  "{item.hookAngle}"
                </p>
              </div>
            )}

            {/* Actions */}
            {item.tag !== "skip" && (
              <div className="flex items-center gap-2">
                {item.tag === "hook-potential" && (
                  <button
                    onClick={() => onSave(item)}
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all",
                      saved
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
                        : "text-gray-500 border-[#1f1f2e] hover:text-violet-400 hover:border-violet-500/20"
                    )}
                  >
                    {saved ? <Check className="w-3 h-3" /> : <BookMarked className="w-3 h-3" />}
                    {saved ? "Saved" : "Save hook"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Slack panel ──────────────────────────────────────────────────────────────

function SlackPanel({ items }: { items: TrendItem[] }) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [scheduledTime] = useState("7:00 AM daily")

  const topFive = items
    .filter(i => i.tag === "hook-potential")
    .sort((a, b) => b.hookScore - a.hookScore || a.minsAgo - b.minsAgo)
    .slice(0, 5)

  const handleSend = async () => {
    setSending(true)
    const res = await sendSlackDigest(topFive)
    setSending(false)
    if (res.success) { setSent(true); setTimeout(() => setSent(false), 3000) }
  }

  const digestPreview = buildDigestText(topFive)

  return (
    <div className="bg-[#111119] border border-[#1f1f2e] rounded-2xl p-4 sticky top-6 max-h-[calc(100vh-120px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-xl bg-[#4A154B]/40 border border-[#4A154B]/60 flex items-center justify-center flex-shrink-0">
          <Bell className="w-3.5 h-3.5 text-[#E01E5A]" />
        </div>
        <div>
          <p className="text-xs font-bold text-white">Slack Digest</p>
          <p className="text-[10px] text-gray-500">{scheduledTime}</p>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px] text-emerald-400 font-medium">Scheduled · 7:00 AM</span>
      </div>

      {/* What will be sent */}
      <div className="mb-4">
        <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-2">
          Top {topFive.length} hook-worthy items
        </p>
        <div className="space-y-1.5">
          {topFive.map((item, i) => (
            <div key={item.id} className="flex items-start gap-2">
              <span className="text-[10px] text-gray-600 font-bold w-4 flex-shrink-0 pt-0.5">{i + 1}.</span>
              <p className="text-[11px] text-gray-400 leading-snug line-clamp-2">{item.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="mb-4">
        <p className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-2">Preview</p>
        <div className="bg-[#0d0d16] border border-[#1a1a28] rounded-xl p-2.5">
          <pre className="text-[10px] text-gray-500 whitespace-pre-wrap leading-relaxed font-mono line-clamp-8">
            {digestPreview}
          </pre>
        </div>
      </div>

      {/* Slack stub notice */}
      <div className="flex items-start gap-2 bg-amber-500/8 border border-amber-500/20 rounded-xl p-2.5 mb-4">
        <AlertCircle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-amber-300/70 leading-relaxed">
          Wire <code className="font-mono text-amber-300">sendSlackDigest()</code> to your Slack webhook or MCP tool to activate.
        </p>
      </div>

      {/* Actions */}
      <button
        onClick={handleSend}
        disabled={sending}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all",
          sent
            ? "bg-emerald-600 text-white"
            : sending
            ? "bg-violet-500/30 text-violet-400 cursor-not-allowed"
            : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/30"
        )}
      >
        {sent
          ? <><Check className="w-4 h-4" /> Sent!</>
          : sending
          ? <><Send className="w-4 h-4 animate-pulse" /> Sending...</>
          : <><Send className="w-4 h-4" /> Send Now</>
        }
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// Convert CachedTrend → TrendItem for display
function cachedToItem(c: CachedTrend, idx: number): TrendItem {
  return {
    id: c.id,
    sourceId: c.source.toLowerCase().replace(/\s/g, "-"),
    title: c.title,
    summary: c.summary,
    minsAgo: Math.round((Date.now() - new Date(c.publishedAt).getTime()) / 60000),
    tag: c.tag,
    hookScore: c.hookScore,
    hookAngle: c.hookAngle,
    category: c.category,
  }
}

export default function Trending() {
  const [activeTag, setActiveTag]     = useState<"all" | Tag>("all")
  const [activeSource, setActiveSource] = useState("all")
  const [activeCategory, setActiveCategory] = useState("All")
  const [refreshing, setRefreshing]   = useState(false)
  const [savedIds, setSavedIds]       = useState<Set<string>>(new Set())
  const [showSourceMenu, setShowSourceMenu] = useState(false)
  const [liveItems, setLiveItems]     = useState<TrendItem[]>([])
  const [usingLive, setUsingLive]     = useState(false)

  const fetchFeed = async () => {
    setRefreshing(true)
    try {
      const res = await fetch("/api/rss")
      if (res.ok) {
        const data = await res.json() as { items: CachedTrend[]; cachedAt: string }
        trendingStore.set(data)
        setLiveItems(data.items.map(cachedToItem))
        setUsingLive(true)
      }
    } catch {}
    setRefreshing(false)
  }

  useEffect(() => {
    // Check localStorage cache first
    const cached = trendingStore.get()
    if (cached && !trendingStore.isStale()) {
      setLiveItems(cached.items.map(cachedToItem))
      setUsingLive(true)
    } else {
      // Fetch fresh data
      fetchFeed()
    }
    // Also mark existing saved hooks as savedIds
    const vaultIds = new Set(hooksStore.list().map(h => h.id))
    // we don't have a mapping here, just leave empty
  }, [])

  const displayItems = usingLive ? liveItems : ITEMS

  const handleRefresh = () => {
    fetchFeed()
  }

  const handleSave = (item: TrendItem) => {
    const hookText = item.hookAngle || item.title
    hooksStore.add({
      id: `trending-${item.id}`,
      original: item.title,
      template: hookText,
      hookType: "Shock",
      niche: item.category || "Tech",
      creatorName: SOURCES.find(s => s.id === item.sourceId)?.name || item.sourceId,
      views: 0,
      viewsLabel: "—",
      savedAt: new Date().toISOString(),
      source: "trending",
    })
    setSavedIds(prev => new Set([...prev, item.id]))
  }

  const topPicks = useMemo(() =>
    displayItems
      .filter(i => i.tag === "hook-potential")
      .sort((a, b) => b.hookScore - a.hookScore || a.minsAgo - b.minsAgo)
      .slice(0, 5),
    [displayItems]
  )

  const filteredFeed = useMemo(() => {
    return displayItems
      .filter(i => {
        if (activeTag !== "all" && i.tag !== activeTag) return false
        if (activeSource !== "all" && i.sourceId !== activeSource) return false
        if (activeCategory !== "All" && i.category !== activeCategory) return false
        return true
      })
      .sort((a, b) => a.minsAgo - b.minsAgo)
  }, [displayItems, activeTag, activeSource, activeCategory])

  const hookCount  = displayItems.filter(i => i.tag === "hook-potential").length
  const activeSourceName = activeSource === "all"
    ? "All sources"
    : SOURCE_MAP[activeSource]?.name ?? activeSource

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <TrendingUp className="w-5 h-5 text-violet-400" />
            <h1 className="text-xl font-bold text-white">What's Trending</h1>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
              12 sources
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/20">
              {hookCount} hook-worthy
            </span>
          </div>
          <p className="text-sm text-gray-500">Auto-tagged · sorted by recency · Slack digest at 7am</p>
        </div>
      </div>

      {/* Source status strip */}
      <SourceStrip refreshing={refreshing} onRefresh={handleRefresh} />

      <div className="flex gap-4 items-start">
        {/* Main column */}
        <div className="flex-1 min-w-0">

          {/* Top 5 hook-worthy */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-3.5 h-3.5 text-orange-400" />
              <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Top 5 Hook-Worthy Today
              </h2>
              <span className="text-[11px] text-gray-600">sorted by score</span>
            </div>
            <div className="space-y-2">
              {topPicks.map((item, i) => (
                <TopPickCard
                  key={item.id}
                  item={item}
                  rank={i + 1}
                  saved={savedIds.has(item.id)}
                  onSave={handleSave}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#1f1f2e]" />
            <span className="text-[11px] text-gray-600 uppercase tracking-wider">Full Feed</span>
            <div className="flex-1 h-px bg-[#1f1f2e]" />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {/* Tag filter */}
            {(["all", "hook-potential", "explainer", "skip"] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTag(t)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                  activeTag === t
                    ? t === "all"
                      ? "bg-violet-500/20 text-violet-300 border-violet-500/30"
                      : cn(TAG_META[t as Tag]?.class, "border-opacity-50")
                    : "bg-[#111119] text-gray-500 border-[#1f1f2e] hover:text-gray-300"
                )}
              >
                {t === "all" ? "All items" : TAG_META[t as Tag].label}
              </button>
            ))}

            {/* Source filter */}
            <div className="relative ml-auto">
              <button
                onClick={() => setShowSourceMenu(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 bg-[#111119] border border-[#1f1f2e] hover:text-white transition-all"
              >
                <span className="truncate max-w-[120px]">{activeSourceName}</span>
                <ChevronDown className="w-3 h-3 flex-shrink-0" />
              </button>
              {showSourceMenu && (
                <div className="absolute right-0 top-full mt-1 bg-[#111119] border border-[#1f1f2e] rounded-xl overflow-hidden z-20 shadow-xl min-w-[180px]">
                  <button
                    onClick={() => { setActiveSource("all"); setShowSourceMenu(false) }}
                    className={cn("w-full text-left px-3 py-2 text-xs transition-all",
                      activeSource === "all" ? "bg-violet-500/15 text-violet-300" : "text-gray-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    All sources
                  </button>
                  {SOURCES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setActiveSource(s.id); setShowSourceMenu(false) }}
                      className={cn("w-full text-left px-3 py-2 text-xs transition-all",
                        activeSource === s.id ? "bg-violet-500/15 text-violet-300" : "text-gray-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1 mb-4 flex-wrap">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all",
                  activeCategory === c
                    ? "bg-[#1a1a2a] border-[#2a2a3e] text-white"
                    : "border-transparent text-gray-600 hover:text-gray-400"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Feed */}
          <div className="space-y-2">
            {filteredFeed.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <TrendingUp className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No items match this filter.</p>
              </div>
            ) : filteredFeed.map(item => (
              <FeedCard
                key={item.id}
                item={item}
                saved={savedIds.has(item.id)}
                onSave={handleSave}
              />
            ))}
          </div>
        </div>

        {/* Slack panel */}
        <div className="w-72 flex-shrink-0">
          <SlackPanel items={ITEMS} />
        </div>
      </div>
    </div>
  )
}
