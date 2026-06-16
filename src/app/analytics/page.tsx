"use client"

import { useState } from "react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from "recharts"
import { Eye, Heart, UserPlus, TrendingUp, Flame, ArrowUpRight, ArrowDownRight, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

const VIEWS_DATA = [
  { day: "Jun 1", views: 45200, saves: 3200 },
  { day: "Jun 3", views: 52100, saves: 3800 },
  { day: "Jun 5", views: 48900, saves: 3100 },
  { day: "Jun 7", views: 71300, saves: 5400 },
  { day: "Jun 9", views: 89400, saves: 7200 },
  { day: "Jun 11", views: 94200, saves: 8100 },
  { day: "Jun 13", views: 120300, saves: 9800 },
  { day: "Jun 15", views: 115000, saves: 9200 },
  { day: "Jun 16", views: 142000, saves: 11200 },
]

const ENGAGEMENT_DATA = [
  { type: "Reels", ig: 14.2, tt: 18.7, yt: 6.3 },
  { type: "Stories", ig: 8.1, tt: 0, yt: 0 },
  { type: "Posts", ig: 5.3, tt: 0, yt: 0 },
  { type: "Shorts", ig: 0, tt: 0, yt: 11.4 },
]

const HEATERS = [
  {
    rank: 1,
    title: "I quit my 9-5 to test this for 30 days...",
    platform: "Instagram",
    views: "2.3M",
    saves: "42.1K",
    follows: "8.9K",
    engagement: "14.2%",
    posted: "Jun 10",
    trend: "up",
    emoji: "🔥",
  },
  {
    rank: 2,
    title: "The creator secret nobody talks about (exposed)",
    platform: "TikTok",
    views: "1.8M",
    saves: "31K",
    follows: "6.7K",
    engagement: "11.8%",
    posted: "Jun 7",
    trend: "up",
    emoji: "💡",
  },
  {
    rank: 3,
    title: "I studied every top creator for 90 days...",
    platform: "Instagram",
    views: "1.4M",
    saves: "28K",
    follows: "5.2K",
    engagement: "9.7%",
    posted: "Jun 3",
    trend: "down",
    emoji: "📊",
  },
]

const STATS = [
  {
    label: "Total Views",
    value: "12.4M",
    change: "+34%",
    up: true,
    icon: Eye,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    label: "Total Saves",
    value: "89.3K",
    change: "+22%",
    up: true,
    icon: Heart,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    label: "New Follows",
    value: "14.7K",
    change: "+41%",
    up: true,
    icon: UserPlus,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    label: "Avg. Engagement",
    value: "12.4%",
    change: "-2.1%",
    up: false,
    icon: TrendingUp,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
]

const RANGES = ["7 days", "30 days", "90 days"]

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#111119",
    border: "1px solid #1f1f2e",
    borderRadius: "10px",
    color: "#f0f0f5",
    fontSize: "12px",
  },
}

export default function Analytics() {
  const [range, setRange] = useState("30 days")

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            <h1 className="text-xl font-bold text-white">Analytics</h1>
          </div>
          <p className="text-sm text-gray-500">IG views, saves, follows, and heaters of the week</p>
        </div>
        <div className="flex items-center gap-1 bg-[#111119] border border-[#1f1f2e] rounded-xl p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                range === r
                  ? "bg-violet-500/20 text-violet-300"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {STATS.map(({ label, value, change, up, icon: Icon, color, bg }) => (
          <div key={label} className="bg-[#111119] border border-[#1f1f2e] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", bg)}>
                <Icon className={cn("w-4 h-4", color)} />
              </div>
              <span
                className={cn(
                  "flex items-center gap-0.5 text-xs font-semibold",
                  up ? "text-emerald-400" : "text-red-400"
                )}
              >
                {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {change}
              </span>
            </div>
            <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Area Chart */}
        <div className="col-span-2 bg-[#111119] border border-[#1f1f2e] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Views Over Time</h3>
              <p className="text-xs text-gray-500 mt-0.5">Daily reach across all platforms</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={VIEWS_DATA} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gSaves" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2a" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: "#4a4a6a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#4a4a6a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip
                {...tooltipStyle}
                formatter={(v: number, n: string) => [
                  `${(v / 1000).toFixed(1)}K`,
                  n === "views" ? "Views" : "Saves",
                ]}
              />
              <Area type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={2} fill="url(#gViews)" />
              <Area type="monotone" dataKey="saves" stroke="#10b981" strokeWidth={2} fill="url(#gSaves)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement breakdown */}
        <div className="bg-[#111119] border border-[#1f1f2e] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Engagement by Type</h3>
          <p className="text-xs text-gray-500 mb-4">Avg. % across platforms</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ENGAGEMENT_DATA} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2a" vertical={false} />
              <XAxis dataKey="type" tick={{ fill: "#4a4a6a", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4a4a6a", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v}%`]} />
              <Bar dataKey="ig" name="Instagram" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="tt" name="TikTok" fill="#06b6d4" radius={[3, 3, 0, 0]} />
              <Bar dataKey="yt" name="YouTube" fill="#f43f5e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heaters of the Week */}
      <div className="bg-[#111119] border border-[#1f1f2e] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <Flame className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-bold text-white">Heaters of the Week</h3>
          <span className="text-xs text-gray-500">Top performing content this week</span>
        </div>
        <div className="space-y-3">
          {HEATERS.map((h) => (
            <div
              key={h.rank}
              className="flex items-center gap-4 p-4 rounded-xl bg-[#0d0d16] border border-[#1a1a2a] hover:border-violet-500/20 transition-all"
            >
              <div className="text-2xl w-8 text-center">{h.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{h.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{h.platform} · {h.posted}</p>
              </div>
              <div className="flex items-center gap-5 text-right">
                <div>
                  <p className="text-sm font-semibold text-white">{h.views}</p>
                  <p className="text-[11px] text-gray-600">views</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{h.saves}</p>
                  <p className="text-[11px] text-gray-600">saves</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{h.follows}</p>
                  <p className="text-[11px] text-gray-600">follows</p>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-0.5 text-sm font-bold",
                    h.trend === "up" ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  {h.trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {h.engagement}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
