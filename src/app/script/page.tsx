"use client"

import { useState, useEffect } from "react"
import {
  FileText, Sparkles, Copy, Check, ChevronDown, X, ArrowLeft,
  RotateCcw, Zap, BookMarked,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type PendingHook = {
  template: string
  hookType: string
  niche: string
  creator: string
  views: string
  autoGenerate?: boolean
}

type Section = { id: string; label: string; placeholder: string; rows: number }

// ─── Config ───────────────────────────────────────────────────────────────────

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "Twitter / X", "LinkedIn"]

const CHAR_LIMITS: Record<string, number> = {
  Instagram: 2200,
  TikTok: 2200,
  "YouTube": 5000,
  "Twitter / X": 280,
  LinkedIn: 3000,
}

const SECTIONS: Section[] = [
  {
    id: "hook",
    label: "Hook",
    placeholder: "Your opening line — the first 1–3 seconds...",
    rows: 3,
  },
  {
    id: "body1",
    label: "Body — Point 1",
    placeholder: "First main point, insight, or reveal...",
    rows: 4,
  },
  {
    id: "body2",
    label: "Body — Point 2",
    placeholder: "Second point, example, or proof...",
    rows: 4,
  },
  {
    id: "body3",
    label: "Body — Point 3 (optional)",
    placeholder: "Third point, twist, or counterintuitive take...",
    rows: 3,
  },
  {
    id: "cta",
    label: "CTA",
    placeholder: "What you want them to do next — comment, save, follow, DM...",
    rows: 2,
  },
]

const HOOK_TYPE_COLORS: Record<string, string> = {
  Listicle:  "bg-yellow-500/15 text-yellow-300 border-yellow-500/20",
  Shock:     "bg-orange-500/15 text-orange-300 border-orange-500/20",
  Contrast:  "bg-pink-500/15 text-pink-300 border-pink-500/20",
  Story:     "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  POV:       "bg-blue-500/15 text-blue-300 border-blue-500/20",
  Question:  "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
  Curiosity: "bg-violet-500/15 text-violet-300 border-violet-500/20",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function CopyBtn({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all",
        copied
          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
          : "bg-[#111119] text-gray-400 border-[#1f1f2e] hover:text-white hover:border-[#2a2a3e]"
      )}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied!" : label}
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Script() {
  const [pendingHook, setPendingHook] = useState<PendingHook | null>(null)
  const [platform, setPlatform] = useState("Instagram")
  const [showPlatformMenu, setShowPlatformMenu] = useState(false)
  const [generating, setGenerating] = useState<string | null>(null)
  const [generatingAll, setGeneratingAll] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const [script, setScript] = useState<Record<string, string>>({
    hook: "",
    body1: "",
    body2: "",
    body3: "",
    cta: "",
  })

  // Load hook from Hook Vault — auto-generate all sections if flagged
  useEffect(() => {
    if (typeof window === "undefined") return
    const raw = localStorage.getItem("pendingHook")
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as PendingHook
        setPendingHook(parsed)
        setScript(s => ({ ...s, hook: parsed.template }))
        if (parsed.autoGenerate) {
          localStorage.removeItem("pendingHook")
          setTimeout(() => generateAll(parsed.template), 400)
        }
      } catch {}
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fullScript = SECTIONS
    .map(s => script[s.id])
    .filter(Boolean)
    .join("\n\n")

  const charCount = fullScript.length
  const limit = CHAR_LIMITS[platform] ?? 2200
  const overLimit = charCount > limit
  const wordCount = fullScript.trim() ? fullScript.trim().split(/\s+/).length : 0

  const generateSection = async (sectionId: string) => {
    setGenerating(sectionId)
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId, hook: script.hook, allSections: [sectionId] }),
      })
      const data = await res.json()
      if (data.results?.[sectionId]) {
        setScript(s => ({ ...s, [sectionId]: data.results[sectionId] }))
      }
    } catch {}
    setGenerating(null)
  }

  const generateAll = async (hookTemplate?: string) => {
    const hookText = hookTemplate ?? script.hook
    if (!hookText) return
    setGeneratingAll(true)
    if (hookTemplate) setScript(s => ({ ...s, hook: hookTemplate }))
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hook: hookText, allSections: ["body1", "body2", "body3", "cta"] }),
      })
      const data = await res.json()
      if (data.results) {
        setScript(s => ({ ...s, ...data.results }))
      }
    } catch {}
    setGeneratingAll(false)
  }

  const clearAll = () => {
    setScript({ hook: "", body1: "", body2: "", body3: "", cta: "" })
    setPendingHook(null)
    if (typeof window !== "undefined") localStorage.removeItem("pendingHook")
    setDismissed(false)
  }

  return (
    <div className="p-8 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Link href="/hook-vault" className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <FileText className="w-5 h-5 text-violet-400" />
            <h1 className="text-xl font-bold text-white">Script</h1>
          </div>
          <p className="text-sm text-gray-500 ml-12">Write your script section by section</p>
        </div>

        {/* Platform selector + Generate all */}
        <div className="flex items-center gap-2">
          {script.hook && (
            <button
              onClick={() => generateAll()}
              disabled={generatingAll}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all",
                generatingAll
                  ? "bg-violet-500/10 text-violet-400 border-violet-500/20 opacity-70 cursor-not-allowed"
                  : "bg-violet-600 text-white border-violet-500/40 hover:bg-violet-500"
              )}
            >
              <Sparkles className={cn("w-3.5 h-3.5", generatingAll && "animate-spin")} />
              {generatingAll ? "Generating..." : "Generate all"}
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setShowPlatformMenu(v => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111119] border border-[#1f1f2e] text-sm text-gray-300 hover:text-white transition-all"
            >
              {platform}
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>
            {showPlatformMenu && (
              <div className="absolute right-0 top-full mt-1 bg-[#111119] border border-[#1f1f2e] rounded-xl overflow-hidden z-20 shadow-xl min-w-[160px]">
                {PLATFORMS.map(p => (
                  <button key={p} onClick={() => { setPlatform(p); setShowPlatformMenu(false) }}
                    className={cn("w-full text-left px-3 py-2.5 text-sm transition-all",
                      platform === p ? "bg-violet-500/15 text-violet-300" : "text-gray-400 hover:bg-white/5 hover:text-white")}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={clearAll} className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 border border-[#1f1f2e] transition-all" title="Clear all">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pending hook banner */}
      {pendingHook && !dismissed && (
        <div className="mb-6 bg-violet-500/8 border border-violet-500/25 rounded-2xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <BookMarked className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-semibold text-violet-300">Hook from Vault</p>
                  {pendingHook.hookType && (
                    <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full border", HOOK_TYPE_COLORS[pendingHook.hookType] || "bg-gray-500/15 text-gray-300 border-gray-500/20")}>
                      {pendingHook.hookType}
                    </span>
                  )}
                  {pendingHook.views && (
                    <span className="text-[10px] text-gray-500">· {pendingHook.views} views</span>
                  )}
                </div>
                <p className="text-sm font-mono leading-relaxed">
                  <TemplateText text={pendingHook.template} />
                </p>
                {pendingHook.creator && (
                  <p className="text-[11px] text-gray-500 mt-1.5">Originally from {pendingHook.creator}</p>
                )}
              </div>
            </div>
            <button onClick={() => setDismissed(true)} className="text-gray-600 hover:text-gray-400 flex-shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Char / word count */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-32 bg-[#1f1f2e] rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", overLimit ? "bg-red-500" : charCount > limit * 0.8 ? "bg-yellow-500" : "bg-violet-500")}
              style={{ width: `${Math.min((charCount / limit) * 100, 100)}%` }}
            />
          </div>
          <span className={cn("text-xs font-medium tabular-nums", overLimit ? "text-red-400" : "text-gray-500")}>
            {charCount.toLocaleString()} / {limit.toLocaleString()}
          </span>
        </div>
        <span className="text-xs text-gray-600">{wordCount} words</span>
      </div>

      {/* Script sections */}
      <div className="space-y-4 mb-8">
        {SECTIONS.map((section) => (
          <div key={section.id} className="bg-[#111119] border border-[#1f1f2e] rounded-2xl overflow-hidden">
            {/* Section header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1a1a28]">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                  {section.label}
                </span>
                {script[section.id] && (
                  <span className="text-[10px] text-gray-600 tabular-nums">
                    {script[section.id].split(/\s+/).filter(Boolean).length}w
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {script[section.id] && <CopyBtn text={script[section.id]} />}
                <button
                  onClick={() => generateSection(section.id)}
                  disabled={generating === section.id}
                  className={cn(
                    "flex items-center gap-1 text-[11px] font-medium transition-all",
                    generating === section.id
                      ? "text-violet-400 opacity-60"
                      : "text-gray-500 hover:text-violet-400"
                  )}
                >
                  <Sparkles className={cn("w-3 h-3", generating === section.id && "animate-spin")} />
                  {generating === section.id ? "Generating..." : "Generate"}
                </button>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              rows={section.rows}
              value={script[section.id]}
              onChange={e => setScript(s => ({ ...s, [section.id]: e.target.value }))}
              placeholder={section.placeholder}
              className="w-full px-4 py-3 bg-transparent text-sm text-gray-200 placeholder:text-gray-700 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        ))}
      </div>

      {/* Full script preview + export */}
      {fullScript && (
        <div className="bg-[#0a0a12] border border-[#1f1f2e] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#1a1a28]">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Script</span>
            </div>
            <CopyBtn text={fullScript} label="Copy full script" />
          </div>
          <pre className="px-5 py-4 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
            {fullScript}
          </pre>
        </div>
      )}
    </div>
  )
}
