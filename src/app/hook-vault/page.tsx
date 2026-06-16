"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Search, Plus, Copy, Eye, BookMarked, X, Flame, Check,
  ArrowRight, Sparkles, SortDesc, SortAsc, ChevronDown,
} from "lucide-react"
import { cn, formatNum } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type Hook = {
  id: number
  original: string
  template: string
  hookType: string
  niche: string
  creator: { name: string; handle: string; initials: string; color: string; platform: string }
  views: number          // raw for sorting/filtering
  viewsLabel: string     // "8.4M"
  dateAdded: string
  tags: string[]
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const HOOKS: Hook[] = [
  {
    id: 1,
    original: "Short-form content just killed long-form and nobody is talking about it.",
    template: "[X] just killed [Y] and nobody is talking about it.",
    hookType: "Shock",
    niche: "Creator Economy",
    creator: { name: "Lara Acosta", handle: "@lara.acosta_", initials: "LA", color: "bg-pink-500", platform: "Instagram" },
    views: 5100000, viewsLabel: "5.1M",
    dateAdded: "Jun 15",
    tags: ["creator", "content", "trend"],
  },
  {
    id: 2,
    original: "Stop posting every day if you actually want to grow on Instagram.",
    template: "Stop doing [X] if you actually want to [DESIRED RESULT].",
    hookType: "Contrast",
    niche: "Creator Economy",
    creator: { name: "Lara Acosta", handle: "@lara.acosta_", initials: "LA", color: "bg-pink-500", platform: "Instagram" },
    views: 1800000, viewsLabel: "1.8M",
    dateAdded: "Jun 13",
    tags: ["instagram", "growth", "strategy"],
  },
  {
    id: 3,
    original: "7 things I wish I knew before starting my business that would have saved me 3 years.",
    template: "[NUMBER] things I wish I knew before [STARTING THING] that would have saved me [TIME].",
    hookType: "Listicle",
    niche: "Business",
    creator: { name: "Alex Hormozi", handle: "@AlexHormozi", initials: "AH", color: "bg-orange-500", platform: "Instagram" },
    views: 8400000, viewsLabel: "8.4M",
    dateAdded: "Jun 14",
    tags: ["business", "entrepreneurship", "mistakes"],
  },
  {
    id: 4,
    original: "ChatGPT just made 90% of marketing agencies obsolete. Here's what to do instead.",
    template: "[NEW TECH] just made [NUMBER]% of [INDUSTRY/ROLE] obsolete. Here's what to do instead.",
    hookType: "Shock",
    niche: "Tech / AI",
    creator: { name: "Dakota Robertson", handle: "@WrongsToWrite", initials: "DR", color: "bg-violet-500", platform: "Twitter" },
    views: 7800000, viewsLabel: "7.8M",
    dateAdded: "Jun 11",
    tags: ["AI", "marketing", "future"],
  },
  {
    id: 5,
    original: "5 AI tools that are making $10K/month for creators who already know about them.",
    template: "[NUMBER] [TOOLS] that are making [$AMOUNT]/month for [PEOPLE] who already know about them.",
    hookType: "Listicle",
    niche: "Tech / AI",
    creator: { name: "Dakota Robertson", handle: "@WrongsToWrite", initials: "DR", color: "bg-violet-500", platform: "Twitter" },
    views: 6400000, viewsLabel: "6.4M",
    dateAdded: "Jun 7",
    tags: ["AI tools", "income", "creator"],
  },
  {
    id: 6,
    original: "The reason most people never get rich isn't lack of money — it's this one mindset shift.",
    template: "The reason most [PEOPLE] never [ACHIEVE X] isn't [OBVIOUS REASON] — it's this one [THING].",
    hookType: "Curiosity",
    niche: "Business",
    creator: { name: "Alex Hormozi", handle: "@AlexHormozi", initials: "AH", color: "bg-orange-500", platform: "Instagram" },
    views: 12000000, viewsLabel: "12M",
    dateAdded: "Jun 5",
    tags: ["money", "mindset", "wealth"],
  },
  {
    id: 7,
    original: "Why every fitness influencer is lying to you about weight loss.",
    template: "Why every [TYPE OF PERSON] is lying to you about [TOPIC].",
    hookType: "Shock",
    niche: "Fitness",
    creator: { name: "Andrew Huberman", handle: "@hubermanlab", initials: "AH", color: "bg-blue-600", platform: "YouTube" },
    views: 9200000, viewsLabel: "9.2M",
    dateAdded: "Jun 8",
    tags: ["fitness", "health", "truth"],
  },
  {
    id: 8,
    original: "Which is actually better for building muscle: cardio or weights? The science might surprise you.",
    template: "Which is actually better for [GOAL]: [OPTION A] or [OPTION B]? The science might surprise you.",
    hookType: "Question",
    niche: "Fitness",
    creator: { name: "Andrew Huberman", handle: "@hubermanlab", initials: "AH", color: "bg-blue-600", platform: "YouTube" },
    views: 5200000, viewsLabel: "5.2M",
    dateAdded: "May 28",
    tags: ["fitness", "science", "muscle"],
  },
  {
    id: 9,
    original: "Nobody tells you that the first 2 years of building a business are supposed to feel like failure.",
    template: "Nobody tells you that [COMMON EXPERIENCE] is supposed to feel like [NEGATIVE FEELING].",
    hookType: "Shock",
    niche: "Business",
    creator: { name: "Gary Vaynerchuk", handle: "@garyvee", initials: "GV", color: "bg-green-600", platform: "Instagram" },
    views: 4700000, viewsLabel: "4.7M",
    dateAdded: "May 30",
    tags: ["entrepreneurship", "mindset", "truth"],
  },
  {
    id: 10,
    original: "I tried posting on LinkedIn every day for 90 days. Here's what actually happened to my business.",
    template: "I tried [DOING X] every day for [NUMBER] days. Here's what actually happened to my [THING].",
    hookType: "Story",
    niche: "Business",
    creator: { name: "Justin Welsh", handle: "@JustinWelsh", initials: "JW", color: "bg-blue-500", platform: "LinkedIn" },
    views: 820000, viewsLabel: "820K",
    dateAdded: "Jun 12",
    tags: ["linkedin", "experiment", "business"],
  },
  {
    id: 11,
    original: "POV: You finally figured out why your content never goes viral — and it's not what you think.",
    template: "POV: You finally figured out why [YOUR THING] never [DESIRED OUTCOME] — and it's not what you think.",
    hookType: "POV",
    niche: "Creator Economy",
    creator: { name: "Shaiival", handle: "@shaiival.ai", initials: "SA", color: "bg-violet-600", platform: "Instagram" },
    views: 2300000, viewsLabel: "2.3M",
    dateAdded: "Jun 15",
    tags: ["viral", "content", "creator"],
  },
  {
    id: 12,
    original: "How I went from 0 to 100K followers in 6 months without posting every day.",
    template: "How I went from [BEFORE] to [AFTER] in [TIME] without [COMMON APPROACH].",
    hookType: "Story",
    niche: "Creator Economy",
    creator: { name: "Lara Acosta", handle: "@lara.acosta_", initials: "LA", color: "bg-pink-500", platform: "Instagram" },
    views: 3500000, viewsLabel: "3.5M",
    dateAdded: "May 20",
    tags: ["growth", "strategy", "instagram"],
  },
  {
    id: 13,
    original: "I studied every viral creator for 90 days. Here's the one thing they all do that nobody talks about.",
    template: "I studied [TOPIC/PEOPLE] for [TIME]. Here's the one thing they all do that nobody talks about.",
    hookType: "Curiosity",
    niche: "Creator Economy",
    creator: { name: "Shaiival", handle: "@shaiival.ai", initials: "SA", color: "bg-violet-600", platform: "Instagram" },
    views: 4100000, viewsLabel: "4.1M",
    dateAdded: "Jun 8",
    tags: ["research", "viral", "strategy"],
  },
  {
    id: 14,
    original: "3 mindset shifts that turned my $0 side hustle into $30K/month in under a year.",
    template: "[NUMBER] [THINGS] that turned my [BAD SITUATION] into [GOOD RESULT] in [TIME].",
    hookType: "Listicle",
    niche: "Business",
    creator: { name: "Alex Hormozi", handle: "@AlexHormozi", initials: "AH", color: "bg-orange-500", platform: "Instagram" },
    views: 11000000, viewsLabel: "11M",
    dateAdded: "Jun 2",
    tags: ["mindset", "income", "business"],
  },
]

// ─── Config ───────────────────────────────────────────────────────────────────

const HOOK_TYPES = ["All", "Listicle", "Shock", "Contrast", "Story", "POV", "Question", "Curiosity"]
const NICHES = ["All", "Creator Economy", "Business", "Fitness", "Tech / AI", "Marketing", "Mindset"]
const VIEW_THRESHOLDS = [
  { label: "Any views", min: 0 },
  { label: "100K+", min: 100_000 },
  { label: "500K+", min: 500_000 },
  { label: "1M+", min: 1_000_000 },
  { label: "5M+", min: 5_000_000 },
]
const SORT_OPTIONS = [
  { label: "Most views", value: "views-desc" },
  { label: "Least views", value: "views-asc" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
]

const TYPE_COLORS: Record<string, string> = {
  Listicle: "bg-yellow-500/15 text-yellow-300 border-yellow-500/20",
  Shock:    "bg-orange-500/15 text-orange-300 border-orange-500/20",
  Contrast: "bg-pink-500/15 text-pink-300 border-pink-500/20",
  Story:    "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  POV:      "bg-blue-500/15 text-blue-300 border-blue-500/20",
  Question: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
  Curiosity:"bg-violet-500/15 text-violet-300 border-violet-500/20",
}

const NICHE_COLORS: Record<string, string> = {
  "Creator Economy": "text-violet-400 bg-violet-500/10",
  "Business":        "text-emerald-400 bg-emerald-500/10",
  "Fitness":         "text-red-400 bg-red-500/10",
  "Tech / AI":       "text-blue-400 bg-blue-500/10",
  "Marketing":       "text-orange-400 bg-orange-500/10",
  "Mindset":         "text-yellow-400 bg-yellow-500/10",
}

function viewColor(views: number) {
  if (views >= 10_000_000) return "text-yellow-400"
  if (views >= 5_000_000)  return "text-orange-400"
  if (views >= 1_000_000)  return "text-violet-400"
  if (views >= 500_000)    return "text-blue-400"
  return "text-gray-400"
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TemplateText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\])/g)
  return (
    <>
      {parts.map((part, i) =>
        /^\[[^\]]+\]$/.test(part) ? (
          <span key={i} className="text-violet-400 font-bold bg-violet-500/10 rounded px-0.5 mx-px">
            {part}
          </span>
        ) : (
          <span key={i} className="text-gray-300">{part}</span>
        )
      )}
    </>
  )
}

function CopyBtn({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      className={cn("flex items-center gap-1 text-[11px] font-medium transition-colors", className,
        copied ? "text-emerald-400" : "text-gray-500 hover:text-violet-400")}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

function CreatorAvatar({ creator }: { creator: Hook["creator"] }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0", creator.color)}>
        {creator.initials}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-200 leading-none">{creator.name}</p>
        <p className="text-[11px] text-gray-500 mt-0.5">{creator.handle} · {creator.platform}</p>
      </div>
    </div>
  )
}

// ─── Save Hook Modal ──────────────────────────────────────────────────────────

type SaveState = {
  original: string; template: string; hookType: string; niche: string
  creatorName: string; handle: string; platform: string; views: string; tags: string
}

function SaveModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"input" | "review">("input")
  const [templatizing, setTemplatizing] = useState(false)
  const [form, setForm] = useState<SaveState>({
    original: "", template: "", hookType: "Shock", niche: "Creator Economy",
    creatorName: "", handle: "", platform: "Instagram", views: "", tags: "",
  })

  const set = (k: keyof SaveState, v: string) => setForm(f => ({ ...f, [k]: v }))

  const autoTemplatize = () => {
    if (!form.original) return
    setTemplatizing(true)
    setTimeout(() => {
      // Simple pattern detection for simulation
      let tpl = form.original
      tpl = tpl.replace(/\b\d+\b/g, "[NUMBER]")
      tpl = tpl.replace(/\$[\d,KkMm]+/g, "[$AMOUNT]")
      tpl = tpl.replace(/\b(days?|weeks?|months?|years?)\b/gi, "[TIME]")
      setForm(f => ({ ...f, template: tpl }))
      setTemplatizing(false)
    }, 1000)
  }

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f0f1a] border border-[#1f1f2e] rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0f0f1a] border-b border-[#1f1f2e] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Save New Hook</h2>
            <p className="text-xs text-gray-500 mt-0.5">Transcribe, templatize, and file it</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Original hook */}
          <div>
            <label className="text-xs text-gray-400 font-semibold mb-1.5 block uppercase tracking-wide">
              Original Hook <span className="text-gray-600 normal-case font-normal">(verbatim)</span>
            </label>
            <textarea
              rows={3}
              value={form.original}
              onChange={e => set("original", e.target.value)}
              placeholder="e.g. 5 things I wish I knew before starting my business..."
              className="w-full px-3 py-2.5 bg-[#0a0a12] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 resize-none"
            />
          </div>

          {/* Template with auto-generate */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                Template <span className="text-gray-600 normal-case font-normal">(use [BRACKETS] for variables)</span>
              </label>
              <button
                onClick={autoTemplatize}
                disabled={!form.original || templatizing}
                className="flex items-center gap-1.5 text-[11px] font-medium text-violet-400 hover:text-violet-300 disabled:opacity-40 transition-colors"
              >
                <Sparkles className={cn("w-3 h-3", templatizing && "animate-spin")} />
                {templatizing ? "Templatizing..." : "Auto-templatize"}
              </button>
            </div>
            <textarea
              rows={2}
              value={form.template}
              onChange={e => set("template", e.target.value)}
              placeholder="[NUMBER] things I wish I knew before [STARTING THING]..."
              className="w-full px-3 py-2.5 bg-[#0a0a12] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 resize-none"
            />
            {form.template && (
              <div className="mt-2 px-3 py-2 bg-violet-500/5 border border-violet-500/15 rounded-xl text-xs">
                <TemplateText text={form.template} />
              </div>
            )}
          </div>

          {/* Hook type + Niche */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-semibold mb-1.5 block uppercase tracking-wide">Hook Type</label>
              <select value={form.hookType} onChange={e => set("hookType", e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0a0a12] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 focus:outline-none focus:border-violet-500/50">
                {HOOK_TYPES.filter(t => t !== "All").map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 font-semibold mb-1.5 block uppercase tracking-wide">Niche</label>
              <select value={form.niche} onChange={e => set("niche", e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0a0a12] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 focus:outline-none focus:border-violet-500/50">
                {NICHES.filter(n => n !== "All").map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          </div>

          {/* Creator info */}
          <div>
            <label className="text-xs text-gray-400 font-semibold mb-1.5 block uppercase tracking-wide">Original Creator</label>
            <div className="grid grid-cols-3 gap-3">
              <input value={form.creatorName} onChange={e => set("creatorName", e.target.value)}
                placeholder="Name"
                className="px-3 py-2.5 bg-[#0a0a12] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50" />
              <input value={form.handle} onChange={e => set("handle", e.target.value)}
                placeholder="@handle"
                className="px-3 py-2.5 bg-[#0a0a12] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50" />
              <select value={form.platform} onChange={e => set("platform", e.target.value)}
                className="px-3 py-2.5 bg-[#0a0a12] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 focus:outline-none focus:border-violet-500/50">
                {["Instagram", "TikTok", "YouTube", "Twitter", "LinkedIn"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Views + Tags */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-semibold mb-1.5 block uppercase tracking-wide">View Count</label>
              <input value={form.views} onChange={e => set("views", e.target.value)}
                placeholder="e.g. 2300000"
                className="w-full px-3 py-2.5 bg-[#0a0a12] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50" />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-semibold mb-1.5 block uppercase tracking-wide">Tags</label>
              <input value={form.tags} onChange={e => set("tags", e.target.value)}
                placeholder="growth, AI, creator"
                className="w-full px-3 py-2.5 bg-[#0a0a12] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50" />
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-[#1f1f2e] text-sm text-gray-400 hover:text-white transition-all">
            Cancel
          </button>
          <button onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors">
            <Flame className="w-4 h-4" />
            Save to Vault
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Hook Card ────────────────────────────────────────────────────────────────

function HookCard({ hook, onUse }: { hook: Hook; onUse: (h: Hook) => void }) {
  return (
    <div className="bg-[#111119] border border-[#1f1f2e] rounded-2xl p-5 hover:border-violet-500/25 transition-all flex flex-col gap-4">
      {/* Top: badges + view count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full border", TYPE_COLORS[hook.hookType] || "bg-gray-500/15 text-gray-300 border-gray-500/20")}>
            {hook.hookType}
          </span>
          <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", NICHE_COLORS[hook.niche] || "bg-gray-500/10 text-gray-400")}>
            {hook.niche}
          </span>
        </div>
        <span className={cn("flex items-center gap-1 text-sm font-bold tabular-nums", viewColor(hook.views))}>
          <Eye className="w-3.5 h-3.5" />
          {hook.viewsLabel}
        </span>
      </div>

      {/* Original */}
      <div>
        <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-1.5">Original</p>
        <p className="text-sm text-gray-300 leading-relaxed">{hook.original}</p>
      </div>

      {/* Template box */}
      <div className="bg-[#0a0a12] border border-[#1a1a28] rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">Template</p>
          <CopyBtn text={hook.template} />
        </div>
        <p className="text-sm leading-relaxed font-mono">
          <TemplateText text={hook.template} />
        </p>
      </div>

      {/* Creator + footer */}
      <div className="flex items-center justify-between pt-1">
        <CreatorAvatar creator={hook.creator} />
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-600">{hook.dateAdded}</span>
          <button
            onClick={() => onUse(hook)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-violet-900/20"
          >
            Use this
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Tags */}
      {hook.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap border-t border-[#1a1a2a] pt-3 -mt-1">
          {hook.tags.map(tag => (
            <span key={tag} className="text-[11px] text-gray-600 bg-[#0a0a12] border border-[#1a1a28] px-2 py-0.5 rounded-md">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type SortKey = "views-desc" | "views-asc" | "newest" | "oldest"

export default function HookVault() {
  const router = useRouter()
  const [query, setQuery]           = useState("")
  const [niche, setNiche]           = useState("All")
  const [hookType, setHookType]     = useState("All")
  const [minViews, setMinViews]     = useState(0)
  const [sortBy, setSortBy]         = useState<SortKey>("views-desc")
  const [showSave, setShowSave]     = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)

  const filtered = useMemo(() => {
    let r = HOOKS
    if (query) {
      const q = query.toLowerCase()
      r = r.filter(h =>
        h.original.toLowerCase().includes(q) ||
        h.template.toLowerCase().includes(q) ||
        h.creator.name.toLowerCase().includes(q) ||
        h.creator.handle.toLowerCase().includes(q) ||
        h.niche.toLowerCase().includes(q) ||
        h.tags.some(t => t.includes(q))
      )
    }
    if (niche !== "All") r = r.filter(h => h.niche === niche)
    if (hookType !== "All") r = r.filter(h => h.hookType === hookType)
    if (minViews > 0) r = r.filter(h => h.views >= minViews)
    const sorted = [...r]
    if (sortBy === "views-desc") sorted.sort((a, b) => b.views - a.views)
    if (sortBy === "views-asc") sorted.sort((a, b) => a.views - b.views)
    if (sortBy === "oldest") sorted.reverse()
    return sorted
  }, [query, niche, hookType, minViews, sortBy])

  const useHook = (hook: Hook) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pendingHook", JSON.stringify({
        template: hook.template,
        hookType: hook.hookType,
        niche: hook.niche,
        creator: hook.creator.name,
        views: hook.viewsLabel,
      }))
    }
    router.push("/script")
  }

  const totalViews = HOOKS.reduce((s, h) => s + h.views, 0)
  const topType = [...HOOK_TYPES.filter(t => t !== "All")]
    .sort((a, b) => HOOKS.filter(h => h.hookType === b).length - HOOKS.filter(h => h.hookType === a).length)[0]

  const currentSort = SORT_OPTIONS.find(s => s.value === sortBy)

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <BookMarked className="w-5 h-5 text-violet-400" />
            <h1 className="text-xl font-bold text-white">Hook Vault</h1>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
              {HOOKS.length} hooks
            </span>
          </div>
          <p className="text-sm text-gray-500">Every viral hook transcribed, templatized, and ready to use</p>
        </div>
        <button
          onClick={() => setShowSave(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-violet-900/30"
        >
          <Plus className="w-4 h-4" />
          Save Hook
        </button>
      </div>

      {/* Stats strip */}
      <div className="flex items-center gap-5 mb-6 px-4 py-3 bg-[#111119] border border-[#1f1f2e] rounded-2xl">
        <div>
          <p className="text-lg font-bold text-white">{formatNum(totalViews)}</p>
          <p className="text-[11px] text-gray-500">total views tracked</p>
        </div>
        <div className="w-px h-8 bg-[#1f1f2e]" />
        <div>
          <p className="text-lg font-bold text-white">{HOOKS.length}</p>
          <p className="text-[11px] text-gray-500">hooks saved</p>
        </div>
        <div className="w-px h-8 bg-[#1f1f2e]" />
        <div>
          <p className="text-lg font-bold text-white">{topType}</p>
          <p className="text-[11px] text-gray-500">most common type</p>
        </div>
        <div className="w-px h-8 bg-[#1f1f2e]" />
        <div>
          <p className="text-lg font-bold text-white">{formatNum(Math.round(totalViews / HOOKS.length))}</p>
          <p className="text-[11px] text-gray-500">avg views / hook</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search hooks, creators, niches, or tags..."
          className="w-full pl-11 pr-4 py-3 bg-[#111119] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/40"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {/* Niche */}
        <div className="flex items-center gap-1 bg-[#111119] border border-[#1f1f2e] rounded-xl p-1">
          {NICHES.map(n => (
            <button key={n} onClick={() => setNiche(n)}
              className={cn("px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                niche === n ? "bg-violet-500/20 text-violet-300" : "text-gray-500 hover:text-gray-300")}>
              {n}
            </button>
          ))}
        </div>

        {/* Hook type */}
        <div className="flex items-center gap-1 bg-[#111119] border border-[#1f1f2e] rounded-xl p-1 flex-wrap">
          {HOOK_TYPES.map(t => (
            <button key={t} onClick={() => setHookType(t)}
              className={cn("px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
                hookType === t ? "bg-violet-500/20 text-violet-300" : "text-gray-500 hover:text-gray-300")}>
              {t}
            </button>
          ))}
        </div>

        {/* View count */}
        <div className="flex items-center gap-1 bg-[#111119] border border-[#1f1f2e] rounded-xl p-1">
          {VIEW_THRESHOLDS.map(({ label, min }) => (
            <button key={label} onClick={() => setMinViews(min)}
              className={cn("px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                minViews === min ? "bg-violet-500/20 text-violet-300" : "text-gray-500 hover:text-gray-300")}>
              {label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="relative ml-auto">
          <button
            onClick={() => setShowSortMenu(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111119] border border-[#1f1f2e] text-xs font-medium text-gray-400 hover:text-white transition-all"
          >
            {sortBy.includes("desc") ? <SortDesc className="w-3.5 h-3.5" /> : <SortAsc className="w-3.5 h-3.5" />}
            {currentSort?.label}
            <ChevronDown className="w-3 h-3" />
          </button>
          {showSortMenu && (
            <div className="absolute right-0 top-full mt-1 bg-[#111119] border border-[#1f1f2e] rounded-xl overflow-hidden z-20 shadow-xl min-w-[140px]">
              {SORT_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => { setSortBy(opt.value as SortKey); setShowSortMenu(false) }}
                  className={cn("w-full text-left px-3 py-2 text-xs font-medium transition-all",
                    sortBy === opt.value ? "bg-violet-500/15 text-violet-300" : "text-gray-400 hover:bg-white/5 hover:text-white")}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2 mb-5">
        <p className="text-xs text-gray-500">
          <span className="font-semibold text-gray-300">{filtered.length}</span> hook{filtered.length !== 1 ? "s" : ""} matched
        </p>
        {(niche !== "All" || hookType !== "All" || minViews > 0 || query) && (
          <button onClick={() => { setQuery(""); setNiche("All"); setHookType("All"); setMinViews(0) }}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
            Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <BookMarked className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-400 mb-1">No hooks matched</p>
          <p className="text-xs text-gray-600">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map(hook => (
            <HookCard key={hook.id} hook={hook} onUse={useHook} />
          ))}
        </div>
      )}

      {showSave && <SaveModal onClose={() => setShowSave(false)} />}
    </div>
  )
}
