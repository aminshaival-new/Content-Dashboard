"use client"

import { useState } from "react"
import { TrendingUp, RefreshCw, BookMarked, ExternalLink, Zap, Star, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

const SOURCES = [
  "TechCrunch", "The Verge", "Wired", "MIT Tech Review", "Ars Technica",
  "VentureBeat", "Bloomberg Tech", "Forbes Tech", "Business Insider", "a16z Blog",
  "Creator Economy", "Morning Brew",
]

const CATEGORIES = ["All", "AI Tools", "Creator Economy", "Social Media", "Business", "Tech"]

const NEWS = [
  {
    id: 1,
    source: "TechCrunch",
    time: "2 hours ago",
    title: "OpenAI's new voice cloning model replicates any voice from 3 seconds of audio",
    summary: "The model achieves 97% similarity in blind human evaluations, raising authenticity concerns but opening massive opportunities for creators to produce multilingual content at scale.",
    hookScore: 9.4,
    tags: ["AI", "Voice", "Creator Tools"],
    category: "AI Tools",
    saved: false,
  },
  {
    id: 2,
    source: "Creator Economy",
    time: "4 hours ago",
    title: "Top creators are now earning more from digital products than brand deals — here's the shift",
    summary: "A new report from Linktree shows 68% of top-earning creators have pivoted their primary revenue to owned products (courses, communities, templates) over sponsored content.",
    hookScore: 8.7,
    tags: ["Monetization", "Creator", "Products"],
    category: "Creator Economy",
    saved: false,
  },
  {
    id: 3,
    source: "The Verge",
    time: "5 hours ago",
    title: "Meta's new AI video tool lets you clone your style across unlimited content",
    summary: "Meta AI Studio now allows creators to train a personalized video model on their existing content, then generate new videos that match their aesthetic, lighting, and editing style.",
    hookScore: 9.1,
    tags: ["Meta", "AI Video", "Creator Tools"],
    category: "AI Tools",
    saved: true,
  },
  {
    id: 4,
    source: "a16z Blog",
    time: "6 hours ago",
    title: "The creator middle class is disappearing — what comes next",
    summary: "New analysis shows the creator economy is bifurcating: mega-creators ($1M+/year) and nano-creators (<$10K/year) are growing, while the 'middle tier' is shrinking. The key differentiator is owned audience vs. rented attention.",
    hookScore: 8.2,
    tags: ["Creator Economy", "Money", "Strategy"],
    category: "Creator Economy",
    saved: false,
  },
  {
    id: 5,
    source: "Wired",
    time: "8 hours ago",
    title: "TikTok's algorithm has quietly changed how it rewards consistency — creators are noticing",
    summary: "Internal documents and creator interviews reveal TikTok has shifted weight toward 'session depth' (how many videos a viewer watches per session from one creator) over raw view count, rewarding depth over breadth.",
    hookScore: 9.6,
    tags: ["TikTok", "Algorithm", "Growth"],
    category: "Social Media",
    saved: false,
  },
  {
    id: 6,
    source: "MIT Tech Review",
    time: "10 hours ago",
    title: "AI agents are beginning to autonomously post on social media — is this the end of 'authentic' content?",
    summary: "Several startups now offer fully autonomous AI social media agents that research, write, and post content without human review. Early adopters report 3x output with 70% of the engagement of human-created content.",
    hookScore: 8.9,
    tags: ["AI Agents", "Automation", "Future"],
    category: "AI Tools",
    saved: false,
  },
  {
    id: 7,
    source: "Morning Brew",
    time: "12 hours ago",
    title: "Instagram is quietly testing a 'Creator Salary' feature that pays top performers a base income",
    summary: "Sources familiar with Instagram's product roadmap say the platform is piloting a program that pays top-tier creators a monthly base salary in exchange for content volume and exclusivity commitments.",
    hookScore: 9.8,
    tags: ["Instagram", "Monetization", "Big News"],
    category: "Social Media",
    saved: false,
  },
  {
    id: 8,
    source: "VentureBeat",
    time: "14 hours ago",
    title: "Runway raises $308M to build the 'operating system' for AI-generated video content",
    summary: "The round values Runway at $4.8B and will fund development of their creator-focused AI video pipeline, which they claim can cut production time by 85% for short-form content.",
    hookScore: 7.8,
    tags: ["Funding", "AI Video", "Tools"],
    category: "Business",
    saved: false,
  },
]

function HookScoreBadge({ score }: { score: number }) {
  const color =
    score >= 9 ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/20"
    : score >= 8 ? "text-yellow-400 bg-yellow-500/15 border-yellow-500/20"
    : "text-gray-400 bg-gray-500/15 border-gray-500/20"

  return (
    <div className={cn("flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-bold", color)}>
      <Zap className="w-3 h-3" />
      {score.toFixed(1)}
    </div>
  )
}

export default function Trending() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set([3]))
  const [refreshing, setRefreshing] = useState(false)

  const refresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1500)
  }

  const toggleSave = (id: number) => {
    setSavedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filtered = NEWS.filter(
    (n) => activeCategory === "All" || n.category === activeCategory
  ).sort((a, b) => b.hookScore - a.hookScore)

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-violet-400" />
            <h1 className="text-xl font-bold text-white">What's Trending</h1>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
              {SOURCES.length} sources
            </span>
          </div>
          <p className="text-sm text-gray-500">AI news tagged by hook potential across 12 sources</p>
        </div>
        <button
          onClick={refresh}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl border border-[#1f1f2e] text-sm text-gray-400 hover:text-white hover:border-[#2a2a3e] transition-all",
            refreshing && "opacity-60"
          )}
        >
          <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          {refreshing ? "Pulling feeds..." : "Refresh feeds"}
        </button>
      </div>

      {/* Sources marquee bar */}
      <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <span className="text-xs text-gray-600 flex-shrink-0 flex items-center gap-1">
          <Filter className="w-3 h-3" />
          Sources:
        </span>
        {SOURCES.map((s) => (
          <span
            key={s}
            className="flex-shrink-0 text-[11px] text-gray-500 bg-[#111119] border border-[#1f1f2e] px-2 py-1 rounded-lg"
          >
            {s}
          </span>
        ))}
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-1.5 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
              activeCategory === cat
                ? "bg-violet-500/20 text-violet-300 border-violet-500/30"
                : "text-gray-500 hover:text-gray-300 border-transparent hover:border-[#1f1f2e]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* News feed */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-[#111119] border border-[#1f1f2e] rounded-2xl p-5 hover:border-violet-500/20 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                {/* Meta row */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md">
                    {item.source}
                  </span>
                  <span className="text-[11px] text-gray-600">{item.time}</span>
                  <span className="text-[11px] text-gray-600">·</span>
                  <span className="text-[11px] text-gray-500">{item.category}</span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-white mb-2 leading-snug">{item.title}</h3>

                {/* Summary */}
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{item.summary}</p>

                {/* Tags + Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] text-gray-500 bg-[#0d0d16] border border-[#1a1a2a] px-2 py-0.5 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <button
                      onClick={() => toggleSave(item.id)}
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all",
                        savedIds.has(item.id)
                          ? "bg-violet-500/15 text-violet-300 border-violet-500/30"
                          : "text-gray-500 border-[#1f1f2e] hover:text-violet-400 hover:border-violet-500/30"
                      )}
                    >
                      <BookMarked className="w-3 h-3" />
                      {savedIds.has(item.id) ? "Saved" : "Save hook"}
                    </button>
                    <button className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 border border-transparent hover:border-[#1f1f2e] transition-all">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Hook Score */}
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <HookScoreBadge score={item.hookScore} />
                <span className="text-[10px] text-gray-600">hook score</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
