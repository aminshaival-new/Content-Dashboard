"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Calendar, Plus, Clock, CheckCircle2, Circle, X, Sparkles,
  ChevronRight, ChevronLeft, BookMarked, Zap, Copy, Check,
  Youtube, Music2, Eye, Trash2, Send, Instagram,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type Platform = "Instagram" | "TikTok" | "YouTube Shorts"
type PostStatus = "scheduled" | "draft" | "published" | "failed"

type ScheduledPost = {
  id: number
  platforms: Platform[]
  hook: string
  angle: string
  cta: string
  captions: Record<Platform, string>
  scheduledFor: string
  scheduledAt: string
  status: PostStatus
  hookType?: string
  viewsEst?: string
  viewsActual?: string
}

type ModalStep = 1 | 2 | 3

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORM_META: Record<Platform, {
  color: string
  icon: React.ElementType
  charLimit: number
  hashtags: string[]
}> = {
  Instagram: {
    color: "text-pink-400",
    icon: Instagram,
    charLimit: 2200,
    hashtags: ["#contentcreator", "#reels", "#instagramreels", "#growthhacks", "#creatortips"],
  },
  TikTok: {
    color: "text-cyan-400",
    icon: Music2,
    charLimit: 2200,
    hashtags: ["#tiktokgrowth", "#fyp", "#foryou", "#contentcreator", "#viral"],
  },
  "YouTube Shorts": {
    color: "text-red-400",
    icon: Youtube,
    charLimit: 500,
    hashtags: ["#shorts", "#youtubeshorts", "#viral"],
  },
}

const PLATFORMS: Platform[] = ["Instagram", "TikTok", "YouTube Shorts"]

const HOOK_TYPES = ["POV", "Listicle", "Shock", "Contrast", "Story", "Question", "Curiosity"]

const VAULT_HOOKS = [
  { template: "POV: You just discovered the [framework] that changes everything...", type: "POV", views: "2.3M" },
  { template: "Nobody tells beginners this about [TOPIC]", type: "Shock", views: "1.1M" },
  { template: "[NUMBER] things I wish I knew before [THING]", type: "Listicle", views: "890K" },
  { template: "Stop doing [BAD HABIT] if you want to [GOAL]", type: "Contrast", views: "450K" },
  { template: "The [SECRET] that took me from [A] to [B] in [TIME]", type: "Story", views: "680K" },
]

const STATUS_META: Record<PostStatus, { label: string; class: string; icon: React.ElementType }> = {
  scheduled: { label: "Scheduled", class: "bg-blue-500/15 text-blue-300 border-blue-500/20", icon: Clock },
  draft:     { label: "Draft",     class: "bg-gray-500/15 text-gray-400 border-gray-500/20", icon: Circle },
  published: { label: "Published", class: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20", icon: CheckCircle2 },
  failed:    { label: "Failed",    class: "bg-red-500/15 text-red-400 border-red-500/20", icon: X },
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const INITIAL_POSTS: ScheduledPost[] = [
  {
    id: 1,
    platforms: ["Instagram", "TikTok"],
    hook: "POV: You just discovered the content framework that changes everything...",
    angle: "Most creators batch content wrong — here's the system that works",
    cta: "Save this for your next batch day",
    captions: {
      Instagram: "POV: You just discovered the content framework that changes everything...\n\nMost creators batch content wrong — here's the system that works.\n\nSave this for your next batch day 👇\n\n#contentcreator #reels #instagramreels #growthhacks #creatortips",
      TikTok: "POV: You just discovered the content framework that changes everything...\n\nMost creators batch content wrong — here's the system that works.\n\nSave this for your next batch day!\n\n#tiktokgrowth #fyp #foryou #contentcreator #viral",
      "YouTube Shorts": "",
    },
    scheduledFor: "Jun 17, 2026 · 9:00 AM",
    scheduledAt: "2026-06-17T09:00:00",
    status: "scheduled",
    hookType: "POV",
    viewsEst: "45K–90K",
  },
  {
    id: 2,
    platforms: ["Instagram", "TikTok", "YouTube Shorts"],
    hook: "Nobody tells beginners this about the algorithm",
    angle: "The truth will change how you post forever",
    cta: "Drop a 🔥 if this hit different",
    captions: {
      Instagram: "Nobody tells beginners this about the algorithm 🔥\n\nThe truth will change how you post forever.\n\nDrop a 🔥 if this hit different\n\n#contentcreator #reels #instagramreels #growthhacks #creatortips",
      TikTok: "Nobody tells beginners this about the algorithm 🔥\n\nThe truth will change how you post forever.\n\nDrop a 🔥 if this hit different\n\n#tiktokgrowth #fyp #foryou #contentcreator #viral",
      "YouTube Shorts": "Nobody tells beginners this about the algorithm.\n\n#shorts #youtubeshorts #viral",
    },
    scheduledFor: "Jun 18, 2026 · 2:00 PM",
    scheduledAt: "2026-06-18T14:00:00",
    status: "scheduled",
    hookType: "Shock",
    viewsEst: "80K–200K",
  },
  {
    id: 3,
    platforms: ["Instagram"],
    hook: "[NUMBER] things I wish I knew before starting my creator journey",
    angle: "I learned these the hard way so you don't have to",
    cta: "Comment the number you're on right now",
    captions: {
      Instagram: "[NUMBER] things I wish I knew before starting my creator journey\n\nI learned these the hard way so you don't have to.\n\nComment the number you're on right now 👇\n\n#contentcreator #reels #instagramreels #growthhacks #creatortips",
      TikTok: "",
      "YouTube Shorts": "",
    },
    scheduledFor: "Jun 19, 2026 · 10:00 AM",
    scheduledAt: "2026-06-19T10:00:00",
    status: "draft",
    hookType: "Listicle",
    viewsEst: "20K–60K",
  },
  {
    id: 4,
    platforms: ["Instagram", "TikTok"],
    hook: "I quit my 9-5 to test this business model for 30 days. Here's what happened...",
    angle: "Honest results — good and bad",
    cta: "Follow for part 2 dropping this week",
    captions: {
      Instagram: "I quit my 9-5 to test this business model for 30 days. Here's what happened...\n\nHonest results — good and bad.\n\nFollow for part 2 dropping this week 🔥\n\n#contentcreator #reels #instagramreels #growthhacks #creatortips",
      TikTok: "I quit my 9-5 to test this business model for 30 days. Here's what happened...\n\nHonest results — good and bad.\n\nFollow for part 2 dropping this week!\n\n#tiktokgrowth #fyp #foryou #contentcreator #viral",
      "YouTube Shorts": "",
    },
    scheduledFor: "Jun 15, 2026 · 9:00 AM",
    scheduledAt: "2026-06-15T09:00:00",
    status: "published",
    hookType: "Story",
    viewsActual: "2.3M",
  },
  {
    id: 5,
    platforms: ["TikTok"],
    hook: "Stop doing this one thing if you want to grow on social media...",
    angle: "The counterintuitive approach that actually works",
    cta: "Save this and test it for 7 days",
    captions: {
      Instagram: "",
      TikTok: "Stop doing this one thing if you want to grow on social media...\n\nThe counterintuitive approach that actually works.\n\nSave this and test it for 7 days 🔥\n\n#tiktokgrowth #fyp #foryou #contentcreator #viral",
      "YouTube Shorts": "",
    },
    scheduledFor: "Jun 14, 2026 · 6:00 PM",
    scheduledAt: "2026-06-14T18:00:00",
    status: "published",
    hookType: "Contrast",
    viewsActual: "1.1M",
  },
]

// ─── Zernio integration stub ──────────────────────────────────────────────────
// Swap the body of this function with:
//   mcp__Zernio__schedule_post({ platform, caption, scheduled_at: scheduledAt })
async function scheduleViaZernio(
  _platform: Platform,
  _caption: string,
  _scheduledAt: string,
): Promise<{ success: boolean }> {
  await new Promise(r => setTimeout(r, 700 + Math.random() * 600))
  return { success: true }
}

// ─── Caption builder ──────────────────────────────────────────────────────────

function buildCaption(platform: Platform, hook: string, angle: string, cta: string): string {
  const { hashtags, charLimit } = PLATFORM_META[platform]
  if (platform === "YouTube Shorts") {
    const short = hook.length > 100 ? hook.slice(0, 97) + "..." : hook
    return `${short}\n\n${hashtags.join(" ")}`
  }
  const emoji = cta ? "" : " 👇"
  const body = [hook + emoji, angle, cta].filter(Boolean).join("\n\n")
  const full = `${body}\n\n${hashtags.join(" ")}`
  return full.slice(0, charLimit)
}

// ─── Small components ─────────────────────────────────────────────────────────

function PlatformIcon({ platform, size = "sm" }: { platform: Platform; size?: "sm" | "xs" }) {
  const Icon = PLATFORM_META[platform].icon
  return <Icon className={cn(PLATFORM_META[platform].color, size === "sm" ? "w-3.5 h-3.5" : "w-3 h-3")} />
}

function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <span className="flex items-center gap-1">
      <PlatformIcon platform={platform} size="xs" />
      <span className={cn("text-[11px] font-medium", PLATFORM_META[platform].color)}>
        {platform}
      </span>
    </span>
  )
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

// ─── Compose modal ────────────────────────────────────────────────────────────

function ComposeModal({
  onClose,
  onScheduled,
}: {
  onClose: () => void
  onScheduled: (post: Omit<ScheduledPost, "id">) => void
}) {
  const [step, setStep] = useState<ModalStep>(1)
  const [hookText, setHookText] = useState("")
  const [angle, setAngle] = useState("")
  const [cta, setCta] = useState("")
  const [hookType, setHookType] = useState("POV")
  const [showVault, setShowVault] = useState(false)
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(
    new Set<Platform>(["Instagram", "TikTok"])
  )
  const [captions, setCaptions] = useState<Record<Platform, string>>({
    Instagram: "", TikTok: "", "YouTube Shorts": "",
  })
  const [activeTab, setActiveTab] = useState<Platform>("Instagram")
  const [date, setDate] = useState("2026-06-20")
  const [time, setTime] = useState("09:00")
  const [generating, setGenerating] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [done, setDone] = useState(false)
  const [results, setResults] = useState<Record<Platform, "idle" | "sending" | "ok" | "err">>({
    Instagram: "idle", TikTok: "idle", "YouTube Shorts": "idle",
  })

  const selectedArr = [...selectedPlatforms] as Platform[]
  const canNext1 = hookText.trim().length > 0
  const canNext2 = selectedPlatforms.size > 0 && selectedArr.some(p => captions[p].trim())

  const togglePlatform = (p: Platform) =>
    setSelectedPlatforms(prev => {
      const next = new Set(prev)
      next.has(p) ? next.delete(p) : next.add(p)
      return next
    })

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      const updated = { ...captions }
      PLATFORMS.forEach(p => {
        if (selectedPlatforms.has(p)) updated[p] = buildCaption(p, hookText, angle, cta)
      })
      setCaptions(updated)
      const first = selectedArr.find(p => selectedPlatforms.has(p))
      if (first) setActiveTab(first)
      setGenerating(false)
    }, 900)
  }

  const handleSchedule = async () => {
    setScheduling(true)
    const scheduledAt = `${date}T${time}:00`

    await Promise.all(
      selectedArr.map(async p => {
        setResults(r => ({ ...r, [p]: "sending" }))
        const res = await scheduleViaZernio(p, captions[p], scheduledAt)
        setResults(r => ({ ...r, [p]: res.success ? "ok" : "err" }))
      })
    )

    setScheduling(false)
    setDone(true)

    const d = new Date(`${date}T${time}`)
    const label =
      d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " · " +
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })

    onScheduled({
      platforms: selectedArr,
      hook: hookText,
      angle,
      cta,
      captions,
      scheduledFor: label,
      scheduledAt,
      status: "scheduled",
      hookType,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111119] border border-[#1f1f2e] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f1f2e] flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-white">Schedule Reel</span>
            <div className="flex items-center gap-1">
              {([1, 2, 3] as const).map(n => (
                <div key={n} className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  n === step ? "bg-violet-500 w-6"
                    : n < step ? "bg-violet-500/40 w-4"
                    : "bg-[#2a2a3e] w-4"
                )} />
              ))}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* ── Step 1: Hook + Angle + CTA ── */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                Step 1 — Content
              </p>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-gray-400 font-medium">Hook</label>
                  <button
                    onClick={() => setShowVault(v => !v)}
                    className="flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    <BookMarked className="w-3 h-3" />
                    Pick from Vault
                  </button>
                </div>

                {showVault && (
                  <div className="mb-2 bg-[#0d0d16] border border-[#1f1f2e] rounded-xl overflow-hidden">
                    {VAULT_HOOKS.map((h, i) => (
                      <button
                        key={i}
                        onClick={() => { setHookText(h.template); setHookType(h.type); setShowVault(false) }}
                        className="w-full text-left px-3 py-2.5 hover:bg-violet-500/10 border-b border-[#1a1a28] last:border-0 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-semibold text-violet-400">{h.type}</span>
                          <span className="text-[10px] text-gray-600">{h.views} views</span>
                        </div>
                        <p className="text-xs text-gray-300 font-mono leading-relaxed">{h.template}</p>
                      </button>
                    ))}
                  </div>
                )}

                <textarea
                  rows={3}
                  value={hookText}
                  onChange={e => setHookText(e.target.value)}
                  placeholder="Your opening line — what stops the scroll..."
                  className="w-full px-3 py-2.5 bg-[#0d0d16] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Hook Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {HOOK_TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => setHookType(t)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                        hookType === t
                          ? "bg-violet-500/20 text-violet-300 border-violet-500/30"
                          : "bg-[#0d0d16] text-gray-500 border-[#1f1f2e] hover:text-gray-300"
                      )}
                    >{t}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Angle / POV</label>
                <textarea
                  rows={2}
                  value={angle}
                  onChange={e => setAngle(e.target.value)}
                  placeholder="The main insight or take, e.g. 'Most creators get this wrong because...'"
                  className="w-full px-3 py-2.5 bg-[#0d0d16] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-medium mb-1.5 block">CTA</label>
                <input
                  value={cta}
                  onChange={e => setCta(e.target.value)}
                  placeholder="e.g. 'Save this' or 'Drop a 🔥 in the comments'"
                  className="w-full px-3 py-2.5 bg-[#0d0d16] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50"
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Platforms + Captions ── */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                Step 2 — Platforms & Captions
              </p>

              <div className="flex gap-2">
                {PLATFORMS.map(p => {
                  const Icon = PLATFORM_META[p].icon
                  const active = selectedPlatforms.has(p)
                  return (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all",
                        active
                          ? "bg-violet-500/15 border-violet-500/30 text-violet-300"
                          : "bg-[#0d0d16] border-[#1f1f2e] text-gray-500 hover:text-gray-300 hover:border-[#2a2a3e]"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", active ? PLATFORM_META[p].color : "text-gray-600")} />
                      {p}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || selectedPlatforms.size === 0}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all",
                  generating
                    ? "bg-violet-500/10 border-violet-500/20 text-violet-400 opacity-70"
                    : "bg-violet-600 hover:bg-violet-500 border-transparent text-white shadow-lg shadow-violet-900/30"
                )}
              >
                <Sparkles className={cn("w-4 h-4", generating && "animate-spin")} />
                {generating ? "Generating captions..." : "Generate from hook + angle + CTA"}
              </button>

              {selectedArr.some(p => captions[p]) ? (
                <div>
                  <div className="flex gap-1 mb-2">
                    {selectedArr.map(p => (
                      <button
                        key={p}
                        onClick={() => setActiveTab(p)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all",
                          activeTab === p
                            ? "bg-[#1a1a2a] border-[#2a2a3e] text-white"
                            : "border-transparent text-gray-500 hover:text-gray-300"
                        )}
                      >
                        <PlatformIcon platform={p} size="xs" />
                        {p === "YouTube Shorts" ? "YT Shorts" : p}
                      </button>
                    ))}
                  </div>

                  {selectedArr.map(p => (
                    <div key={p} className={activeTab === p ? "block" : "hidden"}>
                      <div className="bg-[#0d0d16] border border-[#1f1f2e] rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a1a28]">
                          <div className="flex items-center gap-2">
                            <PlatformIcon platform={p} />
                            <span className={cn("text-xs font-medium", PLATFORM_META[p].color)}>{p}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "text-[11px] tabular-nums",
                              captions[p].length > PLATFORM_META[p].charLimit ? "text-red-400" : "text-gray-600"
                            )}>
                              {captions[p].length}/{PLATFORM_META[p].charLimit}
                            </span>
                            <CopyBtn text={captions[p]} />
                          </div>
                        </div>
                        <textarea
                          rows={8}
                          value={captions[p]}
                          onChange={e => setCaptions(c => ({ ...c, [p]: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-transparent text-sm text-gray-200 focus:outline-none resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-gray-600 text-sm">
                  Select platforms and generate captions above
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Schedule ── */}
          {step === 3 && (
            <div className="space-y-5">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                Step 3 — Schedule
              </p>

              <div className="bg-[#0d0d16] border border-[#1f1f2e] rounded-xl p-4 space-y-2.5">
                <div>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Hook</p>
                  <p className="text-sm text-gray-300 font-mono leading-relaxed line-clamp-2">{hookText}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap pt-1">
                  {selectedArr.map(p => <PlatformBadge key={p} platform={p} />)}
                  <span className="text-[11px] bg-violet-500/10 border border-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full font-medium">
                    {hookType}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 font-medium mb-1.5 block">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0d0d16] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 focus:outline-none focus:border-violet-500/50 [color-scheme:dark]"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 font-medium mb-1.5 block">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0d0d16] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 focus:outline-none focus:border-violet-500/50 [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Per-platform status */}
              {(scheduling || done) && (
                <div className="space-y-2">
                  {selectedArr.map(p => {
                    const r = results[p]
                    return (
                      <div key={p} className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm transition-all",
                        r === "ok"      ? "bg-emerald-500/10 border-emerald-500/20"
                          : r === "err"   ? "bg-red-500/10 border-red-500/20"
                          : r === "sending" ? "bg-violet-500/10 border-violet-500/20"
                          : "bg-[#0d0d16] border-[#1f1f2e]"
                      )}>
                        <PlatformIcon platform={p} />
                        <span className={cn(
                          "flex-1 font-medium",
                          r === "ok" ? "text-emerald-300" : r === "err" ? "text-red-400" : "text-gray-400"
                        )}>{p}</span>
                        {r === "sending" && (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-violet-400/40 border-t-violet-400 animate-spin" />
                        )}
                        {r === "ok"  && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {r === "err" && <X className="w-4 h-4 text-red-400" />}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1f1f2e] flex items-center gap-3 flex-shrink-0">
          {step > 1 && !scheduling && !done && (
            <button
              onClick={() => setStep(s => (s - 1) as ModalStep)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#1f1f2e] text-sm text-gray-400 hover:text-white transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>
          )}

          {done ? (
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Done
            </button>
          ) : step < 3 ? (
            <button
              onClick={() => setStep(s => (s + 1) as ModalStep)}
              disabled={step === 1 ? !canNext1 : !canNext2}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
                (step === 1 ? canNext1 : canNext2)
                  ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/30"
                  : "bg-[#1a1a2a] text-gray-600 cursor-not-allowed"
              )}
            >
              Continue
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSchedule}
              disabled={scheduling}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
                scheduling
                  ? "bg-violet-500/30 text-violet-400 cursor-not-allowed"
                  : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/30"
              )}
            >
              <Send className={cn("w-4 h-4", scheduling && "animate-pulse")} />
              {scheduling
                ? "Scheduling..."
                : `Schedule to ${selectedPlatforms.size} platform${selectedPlatforms.size !== 1 ? "s" : ""}`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post, onDelete }: { post: ScheduledPost; onDelete: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<Platform>(post.platforms[0])
  const StatusIcon = STATUS_META[post.status].icon
  const caption = post.captions[activeTab] || ""

  return (
    <div className="bg-[#111119] border border-[#1f1f2e] rounded-2xl hover:border-violet-500/20 transition-all overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {post.platforms.map(p => <PlatformBadge key={p} platform={p} />)}
              <span className="text-gray-700 text-[11px]">·</span>
              <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full border", STATUS_META[post.status].class)}>
                <StatusIcon className="w-2.5 h-2.5 inline mr-1" />
                {STATUS_META[post.status].label}
              </span>
              {post.hookType && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 font-medium">
                  {post.hookType}
                </span>
              )}
            </div>

            <p className="text-sm text-gray-200 font-medium leading-snug mb-2 line-clamp-2">{post.hook}</p>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.scheduledFor}
              </span>
              {post.status === "published" && post.viewsActual && (
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <Eye className="w-3 h-3" />
                  {post.viewsActual}
                </span>
              )}
              {post.status !== "published" && post.viewsEst && (
                <span className="text-gray-600">Est. {post.viewsEst}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => setExpanded(v => !v)}
              className="text-[11px] text-gray-500 hover:text-gray-300 px-2 py-1 rounded-lg hover:bg-white/5 transition-all"
            >
              {expanded ? "Hide" : "Captions"}
            </button>
            {post.status !== "published" && (
              <button
                onClick={() => onDelete(post.id)}
                className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#1a1a28] px-4 py-3">
          {post.platforms.length > 1 && (
            <div className="flex gap-1 mb-2">
              {post.platforms.map(p => (
                <button
                  key={p}
                  onClick={() => setActiveTab(p)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all",
                    activeTab === p
                      ? "bg-[#1a1a2a] border-[#2a2a3e] text-white"
                      : "border-transparent text-gray-500 hover:text-gray-300"
                  )}
                >
                  <PlatformIcon platform={p} size="xs" />
                  {p === "YouTube Shorts" ? "YT Shorts" : p}
                </button>
              ))}
            </div>
          )}
          {caption ? (
            <>
              <pre className="bg-[#0d0d16] rounded-xl p-3 text-xs text-gray-300 leading-relaxed whitespace-pre-wrap font-mono">
                {caption}
              </pre>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] text-gray-600">{caption.length} chars</span>
                <CopyBtn text={caption} />
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-600 italic py-2">No caption for this platform</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "cd_posts"

function loadPosts(): ScheduledPost[] {
  if (typeof window === "undefined") return INITIAL_POSTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as ScheduledPost[]
  } catch {}
  // First load: seed with initial posts
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_POSTS))
  return INITIAL_POSTS
}

function savePosts(posts: ScheduledPost[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}

export default function Scheduler() {
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [showCompose, setShowCompose] = useState(false)
  const [filter, setFilter] = useState<"all" | Platform>("all")

  useEffect(() => {
    setPosts(loadPosts())
  }, [])

  const filtered = useMemo(
    () => filter === "all" ? posts : posts.filter(p => p.platforms.includes(filter as Platform)),
    [posts, filter]
  )

  const scheduled = filtered.filter(p => p.status === "scheduled")
  const drafts    = filtered.filter(p => p.status === "draft")
  const published = filtered.filter(p => p.status === "published")

  const handleScheduled = (post: Omit<ScheduledPost, "id">) => {
    const newPost = { ...post, id: Date.now() }
    setPosts(prev => {
      const next = [newPost, ...prev]
      savePosts(next)
      return next
    })
    setShowCompose(false)
  }

  return (
    <div className="p-8 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Calendar className="w-5 h-5 text-violet-400" />
            <h1 className="text-xl font-bold text-white">Scheduler</h1>
          </div>
          <p className="text-sm text-gray-500">One-click multi-platform scheduling</p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-violet-900/30"
        >
          <Plus className="w-4 h-4" />
          Schedule Reel
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "In queue",   value: posts.filter(p => p.status === "scheduled").length, color: "text-blue-300" },
          { label: "Total posts", value: posts.length,                                      color: "text-gray-300" },
          { label: "Top views",  value: "2.3M",                                             color: "text-emerald-300" },
        ].map(s => (
          <div key={s.label} className="bg-[#111119] border border-[#1f1f2e] rounded-xl px-4 py-3">
            <p className={cn("text-lg font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Platform filter */}
      <div className="flex items-center gap-1.5 mb-6 flex-wrap">
        {(["all", ...PLATFORMS] as const).map(p => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
              filter === p
                ? "bg-violet-500/20 border-violet-500/30 text-violet-300"
                : "bg-[#111119] border-[#1f1f2e] text-gray-500 hover:text-gray-300 hover:border-[#2a2a3e]"
            )}
          >
            {p !== "all" && <PlatformIcon platform={p as Platform} size="xs" />}
            {p === "all" ? "All platforms" : p}
          </button>
        ))}
      </div>

      {/* Queue sections */}
      {[
        { label: "Upcoming", items: scheduled, dot: "bg-blue-400" },
        { label: "Drafts",   items: drafts,    dot: "bg-gray-500" },
        { label: "Published",items: published, dot: "bg-emerald-400" },
      ].map(({ label, items, dot }) =>
        items.length === 0 ? null : (
          <div key={label} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className={cn("w-2 h-2 rounded-full", dot)} />
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {label} ({items.length})
              </h3>
            </div>
            <div className="space-y-3">
              {items.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={id => setPosts(prev => {
                    const next = prev.filter(p => p.id !== id)
                    savePosts(next)
                    return next
                  })}
                />
              ))}
            </div>
          </div>
        )
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-600">
          <Zap className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No posts yet. Hit Schedule Reel to get started.</p>
        </div>
      )}

      {showCompose && (
        <ComposeModal
          onClose={() => setShowCompose(false)}
          onScheduled={handleScheduled}
        />
      )}
    </div>
  )
}
