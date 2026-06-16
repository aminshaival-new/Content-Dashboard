"use client"

import { useState } from "react"
import {
  Search, Plus, Copy, Eye, Heart, BookMarked, X, Tag, Flame, Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

const CATEGORIES = ["All", "POV", "Question", "Shock", "Story", "Contrast", "Curiosity"]

const HOOKS = [
  {
    id: 1,
    original: "POV: You're scrolling at 2am wondering why your content isn't growing, then you watch this and everything clicks...",
    template: "POV: You're [doing thing] at [time] wondering why [problem], then you [discover this] and everything clicks...",
    category: "POV",
    platform: "Instagram",
    views: "2.3M",
    saves: 4200,
    dateAdded: "Jun 12",
    tags: ["growth", "mindset", "creator"],
  },
  {
    id: 2,
    original: "Nobody tells beginners that the algorithm doesn't care about your quality. It cares about THIS...",
    template: "Nobody tells [audience] that [common belief]. It actually cares about [truth]...",
    category: "Shock",
    platform: "Instagram",
    views: "1.8M",
    saves: 3100,
    dateAdded: "Jun 10",
    tags: ["algorithm", "growth", "creator"],
  },
  {
    id: 3,
    original: "I studied every viral creator for 90 days. Here's the one thing they all do that nobody talks about...",
    template: "I studied [topic/people] for [time period]. Here's the one thing they all do that nobody talks about...",
    category: "Curiosity",
    platform: "TikTok",
    views: "4.1M",
    saves: 8900,
    dateAdded: "Jun 8",
    tags: ["research", "viral", "strategy"],
  },
  {
    id: 4,
    original: "Stop posting every day. I grew faster in 30 days posting 3x/week than in 6 months of daily posts.",
    template: "Stop [common advice]. I [achieved better result] in [shorter time] by [alternative approach].",
    category: "Contrast",
    platform: "Instagram",
    views: "890K",
    saves: 2400,
    dateAdded: "Jun 5",
    tags: ["consistency", "strategy", "growth"],
  },
  {
    id: 5,
    original: "Why do creators with 10K followers make more money than creators with 1M? The answer will change how you think about content...",
    template: "Why do [group A] [achieve better outcome] than [group B with seemingly more]? The answer will change how you think about [topic]...",
    category: "Question",
    platform: "YouTube",
    views: "1.2M",
    saves: 5600,
    dateAdded: "Jun 3",
    tags: ["monetization", "niche", "strategy"],
  },
  {
    id: 6,
    original: "This AI tool is making $50K/month for creators who know about it. Most people have never heard of it.",
    template: "This [tool/method] is making [$X/month] for [people] who know about it. Most people have never heard of it.",
    category: "Shock",
    platform: "TikTok",
    views: "3.7M",
    saves: 7200,
    dateAdded: "May 28",
    tags: ["AI tools", "income", "creator"],
  },
  {
    id: 7,
    original: "I asked 100 viral creators for their #1 hook secret. The most common answer shocked me.",
    template: "I asked [number] [experts] for their [#1 secret/tip]. The most common answer shocked me.",
    category: "Story",
    platform: "Instagram",
    views: "1.5M",
    saves: 3800,
    dateAdded: "May 25",
    tags: ["hooks", "viral", "research"],
  },
  {
    id: 8,
    original: "The creator who posts once a week and makes $30K vs the creator who posts 3x daily and makes $0. Here's the difference...",
    template: "The [person] who [does less] and [achieves more] vs the [person] who [does more] and [achieves less]. Here's the difference...",
    category: "Contrast",
    platform: "Instagram",
    views: "2.1M",
    saves: 4900,
    dateAdded: "May 22",
    tags: ["strategy", "income", "content"],
  },
]

const BADGE_COLORS: Record<string, string> = {
  POV: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  Shock: "bg-orange-500/15 text-orange-300 border-orange-500/20",
  Curiosity: "bg-violet-500/15 text-violet-300 border-violet-500/20",
  Contrast: "bg-pink-500/15 text-pink-300 border-pink-500/20",
  Question: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
  Story: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
}

function TemplateText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\])/g)
  return (
    <>
      {parts.map((part, i) =>
        /^\[[^\]]+\]$/.test(part) ? (
          <span key={i} className="text-violet-400 font-semibold bg-violet-500/10 rounded-sm px-0.5">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-violet-400 transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

export default function HookVault() {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [showModal, setShowModal] = useState(false)
  const [newHook, setNewHook] = useState({ original: "", template: "", category: "POV", tags: "" })

  const filtered = HOOKS.filter((h) => {
    const matchCat = activeCategory === "All" || h.category === activeCategory
    const matchQuery =
      !query ||
      h.original.toLowerCase().includes(query.toLowerCase()) ||
      h.tags.some((t) => t.includes(query.toLowerCase()))
    return matchCat && matchQuery
  })

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookMarked className="w-5 h-5 text-violet-400" />
            <h1 className="text-xl font-bold text-white">Hook Vault</h1>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
              {HOOKS.length} hooks
            </span>
          </div>
          <p className="text-sm text-gray-500">Every viral hook saved, transcribed & templatized</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-violet-900/30"
        >
          <Plus className="w-4 h-4" />
          Save Hook
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hooks or tags..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#111119] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                activeCategory === cat
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "text-gray-500 hover:text-gray-300 border border-transparent hover:border-[#1f1f2e]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filtered.map((hook) => (
          <div
            key={hook.id}
            className="bg-[#111119] border border-[#1f1f2e] rounded-2xl p-5 hover:border-violet-500/30 transition-all group"
          >
            {/* Top row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-[11px] font-semibold px-2 py-0.5 rounded-full border",
                    BADGE_COLORS[hook.category]
                  )}
                >
                  {hook.category}
                </span>
                <span className="text-[11px] text-gray-600">{hook.platform}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                  <Eye className="w-3 h-3" />
                  {hook.views}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                  <Heart className="w-3 h-3" />
                  {hook.saves.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Original hook */}
            <div className="mb-3">
              <p className="text-[11px] text-gray-600 uppercase tracking-wide font-semibold mb-1">Original</p>
              <p className="text-sm text-gray-300 leading-relaxed">{hook.original}</p>
            </div>

            {/* Template */}
            <div className="bg-[#0d0d16] rounded-xl p-3 mb-3 border border-[#1a1a2a]">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] text-violet-500 uppercase tracking-wide font-semibold">Template</p>
                <CopyBtn text={hook.template} />
              </div>
              <p className="text-sm leading-relaxed text-gray-400">
                <TemplateText text={hook.template} />
              </p>
            </div>

            {/* Tags + date */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                {hook.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 text-[11px] text-gray-600">
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-[11px] text-gray-600">{hook.dateAdded}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Hook Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111119] border border-[#1f1f2e] rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white">Save New Hook</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Original Hook</label>
                <textarea
                  rows={3}
                  value={newHook.original}
                  onChange={(e) => setNewHook({ ...newHook, original: e.target.value })}
                  placeholder="Paste the original hook here..."
                  className="w-full px-3 py-2.5 bg-[#0d0d16] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium mb-1.5 block">
                  Template{" "}
                  <span className="text-gray-600 normal-case">(use [brackets] for variables)</span>
                </label>
                <textarea
                  rows={3}
                  value={newHook.template}
                  onChange={(e) => setNewHook({ ...newHook, template: e.target.value })}
                  placeholder="POV: You're [doing thing] and [situation]..."
                  className="w-full px-3 py-2.5 bg-[#0d0d16] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 font-medium mb-1.5 block">Category</label>
                  <select
                    value={newHook.category}
                    onChange={(e) => setNewHook({ ...newHook, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#0d0d16] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 focus:outline-none focus:border-violet-500/50"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 font-medium mb-1.5 block">Tags (comma separated)</label>
                  <input
                    value={newHook.tags}
                    onChange={(e) => setNewHook({ ...newHook, tags: e.target.value })}
                    placeholder="growth, strategy, AI"
                    className="w-full px-3 py-2.5 bg-[#0d0d16] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#1f1f2e] text-sm text-gray-400 hover:text-white hover:border-[#2a2a3e] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
              >
                <Flame className="w-4 h-4 inline mr-1.5" />
                Save Hook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
