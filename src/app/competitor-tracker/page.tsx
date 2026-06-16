"use client"

import { useState } from "react"
import { Users, Plus, RefreshCw, TrendingUp, TrendingDown, Eye, X, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

const COMPETITORS = [
  {
    id: 1,
    name: "Alex Hormozi",
    handle: "@AlexHormozi",
    platform: "Instagram",
    followers: "4.2M",
    initials: "AH",
    color: "bg-orange-500",
    avgViews: "5.8M",
    trend: "up",
    trendPct: "+12%",
    lastScraped: "2 hours ago",
    reels: [
      { title: "How I built a $100M business with no investors", views: "8.4M", date: "Jun 14", hook: "Story" },
      { title: "The sales script that changed my life", views: "5.2M", date: "Jun 10", hook: "Story" },
      { title: "Most business advice is wrong. Here's why", views: "3.7M", date: "Jun 6", hook: "Contrast" },
    ],
  },
  {
    id: 2,
    name: "Lara Acosta",
    handle: "@lara.acosta_",
    platform: "Instagram",
    followers: "890K",
    initials: "LA",
    color: "bg-pink-500",
    avgViews: "1.2M",
    trend: "up",
    trendPct: "+28%",
    lastScraped: "2 hours ago",
    reels: [
      { title: "I went from 0 to 500K followers doing this one thing", views: "3.1M", date: "Jun 13", hook: "Story" },
      { title: "The content framework nobody talks about", views: "1.8M", date: "Jun 9", hook: "Shock" },
      { title: "Why your hooks are killing your growth", views: "980K", date: "Jun 5", hook: "Question" },
    ],
  },
  {
    id: 3,
    name: "Justin Welsh",
    handle: "@JustinWelsh",
    platform: "LinkedIn",
    followers: "520K",
    initials: "JW",
    color: "bg-blue-500",
    avgViews: "340K",
    trend: "down",
    trendPct: "-5%",
    lastScraped: "3 hours ago",
    reels: [
      { title: "I made $5M as a solopreneur. Here's the system", views: "820K", date: "Jun 12", hook: "Curiosity" },
      { title: "Stop chasing followers. Chase this instead", views: "410K", date: "Jun 8", hook: "Contrast" },
      { title: "The one-person business model that actually works", views: "290K", date: "Jun 4", hook: "Shock" },
    ],
  },
  {
    id: 4,
    name: "Dakota Robertson",
    handle: "@WrongsToWrite",
    platform: "Twitter / X",
    followers: "210K",
    initials: "DR",
    color: "bg-violet-500",
    avgViews: "180K",
    trend: "up",
    trendPct: "+19%",
    lastScraped: "1 hour ago",
    reels: [
      { title: "The writing system that generates $50K/month", views: "640K", date: "Jun 15", hook: "Shock" },
      { title: "I analyzed 1000 viral threads. Here's the pattern", views: "290K", date: "Jun 11", hook: "Curiosity" },
      { title: "Your content isn't bad. Your distribution is", views: "140K", date: "Jun 7", hook: "Contrast" },
    ],
  },
]

const HOOK_BADGE: Record<string, string> = {
  Story: "bg-emerald-500/15 text-emerald-300",
  Shock: "bg-orange-500/15 text-orange-300",
  Contrast: "bg-pink-500/15 text-pink-300",
  Question: "bg-cyan-500/15 text-cyan-300",
  Curiosity: "bg-violet-500/15 text-violet-300",
}

export default function CompetitorTracker() {
  const [selected, setSelected] = useState<number | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newHandle, setNewHandle] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  const refresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1800)
  }

  const selectedCreator = COMPETITORS.find((c) => c.id === selected)

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-violet-400" />
            <h1 className="text-xl font-bold text-white">Competitor Tracker</h1>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
              {COMPETITORS.length} creators
            </span>
          </div>
          <p className="text-sm text-gray-500">Top reels from tracked creators, scraped weekly</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl border border-[#1f1f2e] text-sm text-gray-400 hover:text-white hover:border-[#2a2a3e] transition-all",
              refreshing && "opacity-60"
            )}
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            {refreshing ? "Scraping..." : "Refresh All"}
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Creator
          </button>
        </div>
      </div>

      <div className="flex gap-5">
        {/* Creator list */}
        <div className="w-80 flex-shrink-0 space-y-3">
          {COMPETITORS.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id === selected ? null : c.id)}
              className={cn(
                "w-full text-left bg-[#111119] border rounded-2xl p-4 transition-all hover:border-violet-500/30",
                selected === c.id ? "border-violet-500/50 bg-violet-500/5" : "border-[#1f1f2e]"
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0",
                    c.color
                  )}
                >
                  {c.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{c.name}</p>
                  <p className="text-xs text-gray-500">{c.handle}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{c.followers} followers</span>
                <span
                  className={cn(
                    "flex items-center gap-0.5 font-semibold",
                    c.trend === "up" ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  {c.trend === "up" ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {c.trendPct} avg views
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[11px] text-gray-600 bg-[#0d0d16] px-2 py-0.5 rounded-md border border-[#1a1a2a]">
                  {c.platform}
                </span>
                <span className="text-[11px] text-gray-600">· {c.lastScraped}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Creator detail */}
        {selectedCreator ? (
          <div className="flex-1 bg-[#111119] border border-[#1f1f2e] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold", selectedCreator.color)}>
                  {selectedCreator.initials}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{selectedCreator.name}</h2>
                  <p className="text-sm text-gray-500">{selectedCreator.handle} · {selectedCreator.platform}</p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300">
                <ExternalLink className="w-3.5 h-3.5" />
                View Profile
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Followers", value: selectedCreator.followers },
                { label: "Avg Views", value: selectedCreator.avgViews },
                { label: "Last Scraped", value: selectedCreator.lastScraped },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#0d0d16] rounded-xl p-3 border border-[#1a1a2a]">
                  <p className="text-lg font-bold text-white">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>

            {/* Recent reels */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Recent Top Reels
              </h3>
              <div className="space-y-3">
                {selectedCreator.reels.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-xl bg-[#0d0d16] border border-[#1a1a2a] hover:border-violet-500/20 transition-all"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#1a1a2a] flex items-center justify-center text-xs font-bold text-gray-500">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{r.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{r.date}</p>
                    </div>
                    <span
                      className={cn(
                        "text-[11px] font-medium px-2 py-0.5 rounded-full",
                        HOOK_BADGE[r.hook] || "bg-gray-500/15 text-gray-300"
                      )}
                    >
                      {r.hook}
                    </span>
                    <div className="flex items-center gap-1 text-sm font-semibold text-white">
                      <Eye className="w-3.5 h-3.5 text-gray-500" />
                      {r.views}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-[#111119] border border-[#1f1f2e] rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <Users className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Select a creator to see their top reels</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Creator Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111119] border border-[#1f1f2e] rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white">Track a Creator</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Enter their Instagram, TikTok, or YouTube handle to start tracking their top reels weekly.</p>
            <input
              value={newHandle}
              onChange={(e) => setNewHandle(e.target.value)}
              placeholder="@creatorhandle"
              className="w-full px-3 py-2.5 bg-[#0d0d16] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#1f1f2e] text-sm text-gray-400 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
              >
                Start Tracking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
