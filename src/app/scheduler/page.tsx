"use client"

import { useState } from "react"
import {
  Calendar, Plus, Clock, CheckCircle2, Circle, X, Sparkles, Instagram,
  Video, Globe, ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

const PLATFORMS = ["All", "Instagram", "TikTok", "YouTube", "Twitter"]

const POSTS = [
  {
    id: 1,
    platform: "Instagram",
    type: "Reel",
    caption: "POV: You discovered the one content framework that changed everything... Most creators spend years figuring this out. I'm showing you in 60 seconds. 👇\n\n#contentcreator #growthhacks #creatortips",
    scheduledFor: "Jun 17, 2026 · 9:00 AM",
    status: "scheduled",
    hook: "POV Hook",
    views_est: "45K–90K",
    thumbnail: "🎬",
  },
  {
    id: 2,
    platform: "TikTok",
    type: "Video",
    caption: "Nobody tells beginners this about the algorithm. The truth will change how you post forever. 🔥\n\n#tiktokgrowth #algorithm #contentcreator",
    scheduledFor: "Jun 17, 2026 · 2:00 PM",
    status: "scheduled",
    hook: "Shock Hook",
    views_est: "80K–200K",
    thumbnail: "🚀",
  },
  {
    id: 3,
    platform: "Instagram",
    type: "Story",
    caption: "Behind the scenes of how I batch 30 pieces of content in one day...",
    scheduledFor: "Jun 18, 2026 · 10:00 AM",
    status: "scheduled",
    hook: "Curiosity Hook",
    views_est: "12K–25K",
    thumbnail: "📸",
  },
  {
    id: 4,
    platform: "YouTube",
    type: "Short",
    caption: "The creator secret that took me from 0 to 100K in 6 months. I'm not supposed to share this.",
    scheduledFor: "Jun 19, 2026 · 3:00 PM",
    status: "draft",
    hook: "Story Hook",
    views_est: "20K–60K",
    thumbnail: "▶️",
  },
  {
    id: 5,
    platform: "Instagram",
    type: "Reel",
    caption: "I quit my 9-5 to test this business model for 30 days. Here's what happened...",
    scheduledFor: "Jun 15, 2026 · 9:00 AM",
    status: "published",
    hook: "Story Hook",
    views_est: "—",
    views_actual: "2.3M",
    thumbnail: "🔥",
  },
  {
    id: 6,
    platform: "TikTok",
    type: "Video",
    caption: "Stop doing this one thing if you want to grow on social media...",
    scheduledFor: "Jun 14, 2026 · 6:00 PM",
    status: "published",
    hook: "Contrast Hook",
    views_est: "—",
    views_actual: "1.1M",
    thumbnail: "⚡",
  },
]

const STATUS_STYLES: Record<string, { label: string; class: string; icon: typeof CheckCircle2 }> = {
  scheduled: { label: "Scheduled", class: "bg-blue-500/15 text-blue-300 border-blue-500/20", icon: Clock },
  draft: { label: "Draft", class: "bg-gray-500/15 text-gray-400 border-gray-500/20", icon: Circle },
  published: { label: "Published", class: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20", icon: CheckCircle2 },
}

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: "text-pink-400",
  TikTok: "text-cyan-400",
  YouTube: "text-red-400",
  Twitter: "text-sky-400",
}

export default function Scheduler() {
  const [activePlatform, setActivePlatform] = useState("All")
  const [showNew, setShowNew] = useState(false)
  const [newPost, setNewPost] = useState({
    platform: "Instagram",
    type: "Reel",
    caption: "",
    date: "",
    time: "09:00",
  })
  const [generating, setGenerating] = useState(false)

  const filtered = POSTS.filter(
    (p) => activePlatform === "All" || p.platform === activePlatform
  )

  const scheduled = filtered.filter((p) => p.status === "scheduled")
  const drafts = filtered.filter((p) => p.status === "draft")
  const published = filtered.filter((p) => p.status === "published")

  const generateCaption = () => {
    setGenerating(true)
    setTimeout(() => {
      setNewPost((prev) => ({
        ...prev,
        caption:
          "POV: You're about to discover the [content type] framework that helped me grow from [X] to [Y] in [time period]...\n\nMost people [common mistake]. But the ones winning are doing [secret approach].\n\nHere's the breakdown 👇\n\n#contentcreator #growthhacks",
      }))
      setGenerating(false)
    }, 1200)
  }

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-violet-400" />
            <h1 className="text-xl font-bold text-white">Scheduler</h1>
          </div>
          <p className="text-sm text-gray-500">One-click multi-platform scheduling with auto-generated captions</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-violet-900/30"
        >
          <Plus className="w-4 h-4" />
          Schedule Post
        </button>
      </div>

      {/* Platform tabs */}
      <div className="flex items-center gap-1 mb-6 bg-[#111119] border border-[#1f1f2e] rounded-xl p-1 w-fit">
        {PLATFORMS.map((p) => (
          <button
            key={p}
            onClick={() => setActivePlatform(p)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
              activePlatform === p
                ? "bg-violet-500/20 text-violet-300"
                : "text-gray-500 hover:text-gray-300"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Sections */}
      {[
        { label: "Upcoming", items: scheduled, dot: "bg-blue-400" },
        { label: "Drafts", items: drafts, dot: "bg-gray-500" },
        { label: "Published", items: published, dot: "bg-emerald-400" },
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
              {items.map((post) => {
                const StatusIcon = STATUS_STYLES[post.status].icon
                return (
                  <div
                    key={post.id}
                    className="bg-[#111119] border border-[#1f1f2e] rounded-2xl p-4 hover:border-violet-500/20 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-2xl w-10 text-center mt-0.5">{post.thumbnail}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={cn("text-xs font-semibold", PLATFORM_COLORS[post.platform])}>
                            {post.platform}
                          </span>
                          <span className="text-xs text-gray-600">·</span>
                          <span className="text-xs text-gray-500">{post.type}</span>
                          <span className="text-xs text-gray-600">·</span>
                          <span
                            className={cn(
                              "text-[11px] font-medium px-2 py-0.5 rounded-full border",
                              STATUS_STYLES[post.status].class
                            )}
                          >
                            <StatusIcon className="w-2.5 h-2.5 inline mr-1" />
                            {STATUS_STYLES[post.status].label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-2 mb-2">{post.caption}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.scheduledFor}
                          </span>
                          <span className="bg-[#0d0d16] px-2 py-0.5 rounded-md border border-[#1a1a2a]">
                            {post.hook}
                          </span>
                          {post.status === "published" && post.views_actual && (
                            <span className="text-emerald-400 font-semibold">
                              👁 {post.views_actual} views
                            </span>
                          )}
                          {post.status !== "published" && (
                            <span className="text-gray-600">
                              Est. {post.views_est} views
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      )}

      {/* New Post Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111119] border border-[#1f1f2e] rounded-2xl p-6 w-full max-w-xl mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white">Schedule New Post</h2>
              <button onClick={() => setShowNew(false)} className="text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Platform + Type row */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 font-medium mb-1.5 block">Platform</label>
                  <select
                    value={newPost.platform}
                    onChange={(e) => setNewPost({ ...newPost, platform: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#0d0d16] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 focus:outline-none focus:border-violet-500/50"
                  >
                    {["Instagram", "TikTok", "YouTube", "Twitter"].map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 font-medium mb-1.5 block">Content Type</label>
                  <select
                    value={newPost.type}
                    onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#0d0d16] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 focus:outline-none focus:border-violet-500/50"
                  >
                    {["Reel", "Video", "Story", "Post", "Short"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Caption */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-gray-400 font-medium">Caption</label>
                  <button
                    onClick={generateCaption}
                    disabled={generating}
                    className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-60"
                  >
                    <Sparkles className="w-3 h-3" />
                    {generating ? "Generating..." : "Auto-generate"}
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={newPost.caption}
                  onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
                  placeholder="Write your caption or click Auto-generate to create one from your hook vault..."
                  className="w-full px-3 py-2.5 bg-[#0d0d16] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 resize-none"
                />
              </div>

              {/* Date + Time */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 font-medium mb-1.5 block">Date</label>
                  <input
                    type="date"
                    value={newPost.date}
                    onChange={(e) => setNewPost({ ...newPost, date: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#0d0d16] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 focus:outline-none focus:border-violet-500/50 [color-scheme:dark]"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 font-medium mb-1.5 block">Time</label>
                  <input
                    type="time"
                    value={newPost.time}
                    onChange={(e) => setNewPost({ ...newPost, time: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#0d0d16] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 focus:outline-none focus:border-violet-500/50 [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNew(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#1f1f2e] text-sm text-gray-400 hover:text-white transition-all"
              >
                Save as Draft
              </button>
              <button
                onClick={() => setShowNew(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
              >
                Schedule Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
