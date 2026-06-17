"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  Eye, Heart, UserPlus, MessageCircle, Flame, ArrowUpRight,
  ArrowDownRight, BarChart3, Info, Zap, RefreshCw, Edit2, Check, X,
} from "lucide-react"
import { cn, formatNum } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type DayData = { date: string; views: number; saves: number; follows: number; dms: number }
type Range = "7d" | "30d" | "90d"
type ChartMetric = "views" | "saves" | "follows" | "dms"

export type MyPost = {
  title: string
  views: number
  postedDate: string
  hookType: string
  url?: string
  scrapedAt: string
}

// ─── Mock fallback data (90 days: Mar 18 → Jun 16 2026) ──────────────────────

const RAW_VIEWS: number[] = [
  35200, 36800, 33100, 38900, 32400, 35700, 37200,
  285000,
  41200, 38700, 42300, 36800, 39400, 41800, 43200,
  40100, 44800, 38200, 42700, 41100, 39600,
  190000,
  44800, 42300, 46100, 41900, 47800, 43200, 49100, 44700, 48300, 42800,
  50200, 45100, 47600, 43400, 51800, 46200, 49700, 44100, 52300, 47800, 50100, 48600,
  420000,
  53100, 48700, 54800, 50200, 56900, 49100, 55700, 51400,
  57800, 52300, 59100, 53400, 58200, 54700, 60100, 52800, 57300, 55600, 61200, 53900, 59800,
  350000,
  62100, 57800, 63900, 59100, 65400, 60700, 63200, 58900,
  67100, 61800, 64300, 60200, 67800, 62400,
  680000,
  65200, 67800, 63400, 69100,
  1200000,
  72400, 74800, 75100,
]

function buildMockData(): DayData[] {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  return RAW_VIEWS.map((views, i) => {
    const d = new Date(2026, 5, 16)
    d.setDate(d.getDate() - (89 - i))
    const label = `${months[d.getMonth()]} ${d.getDate()}`
    const saveRate   = 0.04 + ((i * 7)  % 40) * 0.001
    const followRate = 0.006 + ((i * 11) % 9) * 0.001
    const dmRate     = 0.003 + ((i * 13) % 5) * 0.001
    return {
      date: label,
      views,
      saves:   Math.round(views * saveRate),
      follows: Math.round(views * followRate),
      dms:     Math.round(views * dmRate),
    }
  })
}

const MOCK_DATA = buildMockData()

const MOCK_REELS = [
  { id: 1, title: "I quit my 9-5 to test this for 30 days...", views: 2300000, daysAgo: 2,  postedDate: "Jun 14", hookType: "Story",    whatMadeItPop: "Personal stakes in the first 2 words ('I quit') fired a curiosity gap before any scroll decision — watch rate was 3.2× your avg" },
  { id: 2, title: "The creator secret nobody talks about (exposed)", views: 1100000, daysAgo: 7, postedDate: "Jun 9", hookType: "Shock", whatMadeItPop: "Pattern interrupt: dropped the punchline at 0.8s — snagged viewers who never make it past the first 2 seconds" },
  { id: 3, title: "Nobody tells you THIS about the IG algorithm", views: 680000,  daysAgo: 9,  postedDate: "Jun 7",  hookType: "Shock",    whatMadeItPop: "Forbidden-knowledge frame drove a 12% save rate (4× avg) — people bookmarked it to act on later, which recycled reach for 6 days" },
  { id: 4, title: "I studied every top creator for 90 days. Here's the one thing...", views: 420000, daysAgo: 44, postedDate: "May 3", hookType: "Curiosity", whatMadeItPop: "Open loop held 94% completion — the payoff landed in the last second, so the algorithm read the full watch as strong retention" },
  { id: 5, title: "7 things I wish I knew before I went viral", views: 350000, daysAgo: 24, postedDate: "May 23", hookType: "Listicle", whatMadeItPop: "Listicle made DM volume 8× avg — viewers wrote asking for the full list, which boosted shares and triggered explore-page placement" },
  { id: 6,  title: "My exact morning content routine",     views: 74800,  daysAgo: 3,  postedDate: "Jun 13", hookType: "POV",      whatMadeItPop: "" },
  { id: 7,  title: "Behind the scenes: batch filming day", views: 58200,  daysAgo: 6,  postedDate: "Jun 10", hookType: "Story",    whatMadeItPop: "" },
  { id: 8,  title: "3 AI tools I use every single week",   views: 67400,  daysAgo: 11, postedDate: "Jun 5",  hookType: "Listicle", whatMadeItPop: "" },
  { id: 9,  title: "Why your hooks are killing your reach",views: 63100,  daysAgo: 15, postedDate: "Jun 1",  hookType: "Contrast", whatMadeItPop: "" },
  { id: 10, title: "Stop boosting posts. Do this instead", views: 54900,  daysAgo: 19, postedDate: "May 28", hookType: "Contrast", whatMadeItPop: "" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function median(nums: number[]) {
  if (!nums.length) return 0
  const s = [...nums].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 !== 0 ? s[m] : Math.round((s[m - 1] + s[m]) / 2)
}

function sumField(data: DayData[], key: keyof DayData) {
  return data.reduce((s, d) => s + (d[key] as number), 0)
}

function pctChange(curr: number, prev: number) {
  if (prev === 0) return 0
  return Math.round(((curr - prev) / prev) * 100)
}

function postsToChartData(posts: MyPost[]): DayData[] {
  return [...posts]
    .sort((a, b) => new Date(a.scrapedAt).getTime() - new Date(b.scrapedAt).getTime())
    .map(p => ({
      date:    p.postedDate,
      views:   p.views,
      saves:   Math.round(p.views * 0.06),
      follows: Math.round(p.views * 0.01),
      dms:     Math.round(p.views * 0.005),
    }))
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ values, color, id }: { values: number[]; color: string; id: string }) {
  return (
    <ResponsiveContainer width="100%" height={52}>
      <AreaChart data={values.map(v => ({ v }))} margin={{ top: 3, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#${id})`} dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

type MetricDef = { key: "views"|"saves"|"follows"|"dms"; label: string; icon: typeof Eye; color: string; sparkId: string; iconBg: string }

const METRICS: MetricDef[] = [
  { key: "views",   label: "Views",   icon: Eye,           color: "#8b5cf6", sparkId: "sp-views",   iconBg: "bg-violet-500/15" },
  { key: "saves",   label: "Saves*",  icon: Heart,         color: "#10b981", sparkId: "sp-saves",   iconBg: "bg-emerald-500/15" },
  { key: "follows", label: "Follows*",icon: UserPlus,      color: "#3b82f6", sparkId: "sp-follows", iconBg: "bg-blue-500/15" },
  { key: "dms",     label: "DMs*",    icon: MessageCircle, color: "#f59e0b", sparkId: "sp-dms",     iconBg: "bg-amber-500/15" },
]

function MetricCard({ metric, current, previous, sparkValues }: { metric: MetricDef; current: number; previous: number; sparkValues: number[] }) {
  const pct = pctChange(current, previous)
  const up = pct >= 0
  const Icon = metric.icon
  return (
    <div className="bg-[#111119] border border-[#1f1f2e] rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", metric.iconBg)}>
          <Icon className="w-4 h-4" style={{ color: metric.color }} />
        </div>
        <span className={cn("flex items-center gap-0.5 text-xs font-bold", up ? "text-emerald-400" : "text-red-400")}>
          {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {Math.abs(pct)}%
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-white tracking-tight">{formatNum(current)}</p>
        <p className="text-xs text-gray-500 mt-0.5">{metric.label}</p>
      </div>
      <Sparkline values={sparkValues} color={metric.color} id={metric.sparkId} />
    </div>
  )
}

// ─── Heater Row ───────────────────────────────────────────────────────────────

const HOOK_BADGE: Record<string, string> = {
  Story:    "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  Shock:    "bg-orange-500/15 text-orange-300 border-orange-500/20",
  Curiosity:"bg-violet-500/15 text-violet-300 border-violet-500/20",
  Listicle: "bg-yellow-500/15 text-yellow-300 border-yellow-500/20",
  Contrast: "bg-pink-500/15 text-pink-300 border-pink-500/20",
  POV:      "bg-blue-500/15 text-blue-300 border-blue-500/20",
  Question: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
}

function HeaterRow({ rank, title, views, postedDate, hookType, note, med, url }: {
  rank: number; title: string; views: number; postedDate: string; hookType: string; note: string; med: number; url?: string
}) {
  const mult = med > 0 ? Math.round(views / med) : 0
  const isTop = rank === 1
  return (
    <div className={cn("rounded-2xl border p-4 transition-all", isTop ? "bg-gradient-to-r from-orange-500/8 to-transparent border-orange-500/25" : "bg-[#0d0d16] border-[#1a1a2a] hover:border-violet-500/20")}>
      <div className="flex items-start gap-4">
        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5", isTop ? "bg-orange-500 text-white" : "bg-[#1f1f2e] text-gray-400")}>{rank}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-snug mb-1">{title}</p>
          <div className="flex items-center gap-2 mb-2">
            <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full border", HOOK_BADGE[hookType] || "bg-gray-500/15 text-gray-300 border-gray-500/20")}>{hookType}</span>
            <span className="text-[11px] text-gray-500">{postedDate}</span>
            {url && <a href={url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors">Watch →</a>}
          </div>
          {note && <p className="text-xs text-gray-400 leading-relaxed italic border-l-2 border-violet-500/30 pl-2.5">{note}</p>}
        </div>
        <div className="text-right flex-shrink-0">
          <p className={cn("text-lg font-black tabular-nums", isTop ? "text-orange-400" : "text-violet-400")}>{formatNum(views)}</p>
          {mult > 0 && (
            <div className="flex items-center gap-1 justify-end mt-0.5">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-[11px] font-bold text-yellow-400">{mult}× median</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const RANGE_DAYS: Record<Range, number> = { "7d": 7, "30d": 30, "90d": 90 }

const TT_STYLE = {
  contentStyle: { backgroundColor: "#111119", border: "1px solid #1f1f2e", borderRadius: "10px", color: "#f0f0f5", fontSize: "12px" },
  labelStyle: { color: "#6b6b8a" },
}

export default function Analytics() {
  const [range, setRange]             = useState<Range>("30d")
  const [chartMetric, setChartMetric] = useState<ChartMetric>("views")

  // My account
  const [myHandle, setMyHandle]       = useState("")
  const [editHandle, setEditHandle]   = useState(false)
  const [draftHandle, setDraftHandle] = useState("")
  const [myPosts, setMyPosts]         = useState<MyPost[]>([])
  const [scraping, setScraping]       = useState(false)
  const [scrapeRunId, setScrapeRunId] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const h = localStorage.getItem("cd_my_handle") || ""
    setMyHandle(h)
    try {
      const raw = localStorage.getItem("cd_my_analytics")
      if (raw) setMyPosts(JSON.parse(raw) as MyPost[])
    } catch {}
  }, [])

  // Poll scrape status
  useEffect(() => {
    if (!scrapeRunId) return
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/scrape-status?runId=${scrapeRunId}&accountId=0&platform=Instagram`)
        const data = await res.json()
        if (data.status === "done") {
          const posts: MyPost[] = (data.reels || []).map((r: { hook: string; views: number; postedDate: string; hookType: string; url?: string }) => ({
            title:     r.hook,
            views:     r.views,
            postedDate:r.postedDate,
            hookType:  r.hookType,
            url:       r.url,
            scrapedAt: new Date().toISOString(),
          }))
          setMyPosts(posts)
          try { localStorage.setItem("cd_my_analytics", JSON.stringify(posts)) } catch {}
          setScrapeRunId(null)
          setScraping(false)
        } else if (data.status === "failed") {
          setScrapeRunId(null)
          setScraping(false)
        }
      } catch {}
    }, 5000)
    return () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null } }
  }, [scrapeRunId])

  const scrapeMyAccount = async (handle: string) => {
    setScraping(true)
    try {
      const res = await fetch("/api/scrape-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, platform: "Instagram", accountId: 0, limit: 20 }),
      })
      if (res.ok) {
        const { runId } = await res.json()
        if (runId) { setScrapeRunId(runId); return }
      }
    } catch {}
    setScraping(false)
  }

  const saveHandle = () => {
    const h = draftHandle.trim()
    if (!h) return
    const handle = h.startsWith("@") ? h : `@${h}`
    setMyHandle(handle)
    try { localStorage.setItem("cd_my_handle", handle) } catch {}
    setEditHandle(false)
    // Clear old posts and rescrape
    setMyPosts([])
    try { localStorage.removeItem("cd_my_analytics") } catch {}
    void scrapeMyAccount(handle)
  }

  const hasLive = myPosts.length > 0

  // Chart data
  const days = RANGE_DAYS[range]
  const allData: DayData[] = hasLive ? postsToChartData(myPosts) : MOCK_DATA

  const current  = useMemo(() => allData.slice(-Math.min(days, allData.length)), [allData, days])
  const previous = useMemo(() => allData.slice(-(Math.min(days, allData.length) * 2), -Math.min(days, allData.length)), [allData, days])

  const totals = useMemo(() => ({
    views:   sumField(current, "views"),
    saves:   sumField(current, "saves"),
    follows: sumField(current, "follows"),
    dms:     sumField(current, "dms"),
  }), [current])

  const prevTotals = useMemo(() => ({
    views:   sumField(previous, "views"),
    saves:   sumField(previous, "saves"),
    follows: sumField(previous, "follows"),
    dms:     sumField(previous, "dms"),
  }), [previous])

  const sparkValues = useMemo(() => ({
    views:   current.map(d => d.views),
    saves:   current.map(d => d.saves),
    follows: current.map(d => d.follows),
    dms:     current.map(d => d.dms),
  }), [current])

  // Chart display data
  const chartData = useMemo(() => {
    if (current.length <= 30) return current
    const step = Math.ceil(current.length / 30)
    return current.filter((_, i) => i % step === 0 || i === current.length - 1)
  }, [current])

  // Heaters
  const allPostViews = hasLive ? myPosts.map(p => p.views) : MOCK_REELS.filter(r => r.daysAgo <= 30).map(r => r.views)
  const med = median(allPostViews)
  const heaters = hasLive
    ? myPosts.filter(p => p.views >= med * 2).sort((a, b) => b.views - a.views).slice(0, 5)
        .map((p, i) => ({ rank: i + 1, title: p.title, views: p.views, postedDate: p.postedDate, hookType: p.hookType, note: "", url: p.url }))
    : MOCK_REELS.filter(r => r.daysAgo <= 30 && r.views >= med * 2).sort((a, b) => b.views - a.views).slice(0, 5)
        .map((r, i) => ({ rank: i + 1, title: r.title, views: r.views, postedDate: r.postedDate, hookType: r.hookType, note: r.whatMadeItPop, url: undefined }))

  const accentColor = METRICS.find(m => m.key === chartMetric)?.color ?? "#8b5cf6"

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            <h1 className="text-xl font-bold text-white">Analytics</h1>
            {hasLive && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                Live
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {hasLive ? `${myPosts.length} reels scraped · saves & follows estimated` : "IG views · saves · follows · DM volume"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Handle selector */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#111119] border border-[#1f1f2e] rounded-xl">
            {editHandle ? (
              <>
                <input
                  autoFocus
                  value={draftHandle}
                  onChange={e => setDraftHandle(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") saveHandle(); if (e.key === "Escape") setEditHandle(false) }}
                  placeholder="@yourhandle"
                  className="text-xs bg-transparent text-gray-200 placeholder:text-gray-600 outline-none w-32"
                />
                <button onClick={saveHandle} className="text-emerald-400 hover:text-emerald-300"><Check className="w-3.5 h-3.5" /></button>
                <button onClick={() => setEditHandle(false)} className="text-gray-600 hover:text-gray-400"><X className="w-3.5 h-3.5" /></button>
              </>
            ) : (
              <>
                <span className="text-xs text-gray-400">{myHandle || "No account"}</span>
                <button onClick={() => { setDraftHandle(myHandle); setEditHandle(true) }} className="text-gray-600 hover:text-violet-400 transition-colors">
                  <Edit2 className="w-3 h-3" />
                </button>
                {myHandle && (
                  <button onClick={() => scrapeMyAccount(myHandle)} disabled={scraping} title="Re-scrape" className="text-gray-600 hover:text-violet-400 disabled:opacity-40 transition-colors">
                    <RefreshCw className={cn("w-3 h-3", scraping && "animate-spin")} />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Range picker */}
          <div className="flex items-center gap-1 bg-[#111119] border border-[#1f1f2e] rounded-xl p-1">
            {(["7d", "30d", "90d"] as Range[]).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={cn("px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  range === r ? "bg-violet-500/20 text-violet-300" : "text-gray-500 hover:text-gray-300")}>
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Connect CTA (no handle set) */}
      {!myHandle && !scraping && (
        <div className="mb-6 px-5 py-4 bg-violet-500/5 border border-violet-500/20 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white mb-0.5">Connect your Instagram account</p>
            <p className="text-xs text-gray-500">Enter your handle above to pull real reel performance data via Apify.</p>
          </div>
          <button
            onClick={() => { setDraftHandle(""); setEditHandle(true) }}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
          >
            Add handle
          </button>
        </div>
      )}

      {/* Scraping banner */}
      {scraping && (
        <div className="mb-6 px-5 py-3 bg-[#111119] border border-violet-500/20 rounded-2xl flex items-center gap-3">
          <RefreshCw className="w-4 h-4 text-violet-400 animate-spin flex-shrink-0" />
          <p className="text-sm text-gray-300">Scraping reels for <span className="text-violet-300 font-semibold">{myHandle}</span> via Apify — this takes ~30–60 seconds…</p>
        </div>
      )}

      {/* Mock data notice */}
      {!hasLive && !scraping && myHandle && (
        <div className="mb-6 px-5 py-3 bg-[#111119] border border-amber-500/20 rounded-2xl flex items-center gap-3">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-xs text-gray-400">Showing sample data — <span className="text-amber-300">APIFY_API_TOKEN</span> is required in Vercel env vars to load your real posts.</p>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {METRICS.map(m => (
          <MetricCard
            key={m.key}
            metric={m}
            current={totals[m.key]}
            previous={prevTotals[m.key]}
            sparkValues={sparkValues[m.key]}
          />
        ))}
      </div>

      {/* Main chart */}
      <div className="bg-[#111119] border border-[#1f1f2e] rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-white">Performance over time</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {hasLive ? `${myPosts.length} real posts` : `${days}-day window · ${current.length} data points`}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-[#0d0d16] border border-[#1a1a2a] rounded-xl p-1">
            {(["views", "saves", "follows", "dms"] as ChartMetric[]).map(m => (
              <button key={m} onClick={() => setChartMetric(m)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all",
                  chartMetric === m ? "bg-violet-500/20 text-violet-300" : "text-gray-500 hover:text-gray-300")}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="main-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2a" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#4a4a6a", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#4a4a6a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatNum} />
            <Tooltip {...TT_STYLE} formatter={(v: number) => [formatNum(v), chartMetric.charAt(0).toUpperCase() + chartMetric.slice(1)]} />
            <Area type="monotone" dataKey={chartMetric} stroke={accentColor} strokeWidth={2} fill="url(#main-gradient)" dot={hasLive} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Heaters */}
      <div className="bg-[#111119] border border-[#1f1f2e] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a2a]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-white">Heaters</h3>
            </div>
            <span className="text-xs text-gray-500">reels that beat your median by 2×</span>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-xs text-gray-600 mb-0.5">median views</p>
              <p className="text-sm font-bold text-white">{formatNum(med)}</p>
            </div>
            <div className="w-px h-8 bg-[#1f1f2e]" />
            <div>
              <p className="text-xs text-gray-600 mb-0.5">heater threshold</p>
              <p className="text-sm font-bold text-orange-400">{formatNum(med * 2)}+</p>
            </div>
            <div className="w-px h-8 bg-[#1f1f2e]" />
            <div>
              <p className="text-xs text-gray-600 mb-0.5">reels qualified</p>
              <p className="text-sm font-bold text-white">{heaters.length} / {hasLive ? myPosts.length : MOCK_REELS.filter(r => r.daysAgo <= 30).length}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {heaters.length === 0 ? (
            <div className="text-center py-10">
              <Flame className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-500">{hasLive ? "No heaters yet — keep posting" : "Connect your account to see real heaters"}</p>
            </div>
          ) : heaters.map(h => (
            <HeaterRow key={h.rank} {...h} med={med} />
          ))}
        </div>

        <div className="px-5 py-3 border-t border-[#1a1a2a] flex items-center gap-2">
          <Info className="w-3 h-3 text-gray-600 flex-shrink-0" />
          <p className="text-[11px] text-gray-600">
            {hasLive
              ? `${myPosts.length} reels scraped · views are real · saves/follows/DMs marked * are estimated at 6%/1%/0.5% of views`
              : "Sample data shown — connect your Instagram handle to see your real performance"}
          </p>
        </div>
      </div>
    </div>
  )
}
