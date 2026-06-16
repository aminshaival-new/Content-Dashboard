"use client"

import { useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight, Sparkles, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

// Scheduled content keyed by "YYYY-MM-DD"
const CONTENT: Record<string, { type: string; title: string; hook: string; platform: string }[]> = {
  "2026-06-01": [{ type: "reel", title: "AI tools changing my workflow", hook: "Curiosity", platform: "IG" }],
  "2026-06-03": [{ type: "post", title: "Creator economy stats thread", hook: "Shock", platform: "TW" }],
  "2026-06-05": [{ type: "reel", title: "My morning routine reveal", hook: "POV", platform: "TT" }],
  "2026-06-08": [{ type: "story", title: "Q&A: Growing on IG in 2026", hook: "Question", platform: "IG" }],
  "2026-06-10": [{ type: "reel", title: "The hook formula that 10x'd my views", hook: "Curiosity", platform: "IG" }],
  "2026-06-12": [{ type: "post", title: "Weekly breakdown breakdown", hook: "Story", platform: "TW" }],
  "2026-06-15": [{ type: "reel", title: "Stop making this content mistake", hook: "Contrast", platform: "IG" }],
  "2026-06-17": [{ type: "reel", title: "My content stack 2026", hook: "Curiosity", platform: "YT" }],
  "2026-06-19": [{ type: "post", title: "Engagement strategy breakdown", hook: "Story", platform: "TW" }],
  "2026-06-22": [
    { type: "reel", title: "How I batch 30 reels in one day", hook: "Curiosity", platform: "IG" },
    { type: "short", title: "Quick tip: best posting time", hook: "Shock", platform: "YT" },
  ],
  "2026-06-24": [{ type: "story", title: "Behind the scenes filming day", hook: "POV", platform: "IG" }],
  "2026-06-26": [{ type: "reel", title: "Creator lessons from 1M views", hook: "Story", platform: "TT" }],
  "2026-06-29": [{ type: "post", title: "June wrap-up + stats", hook: "Story", platform: "TW" }],
}

const TYPE_COLORS: Record<string, string> = {
  reel: "bg-violet-500",
  post: "bg-blue-500",
  story: "bg-pink-500",
  short: "bg-orange-500",
}

const PLATFORM_COLORS: Record<string, string> = {
  IG: "text-pink-400",
  TT: "text-cyan-400",
  YT: "text-red-400",
  TW: "text-sky-400",
}

const HOOK_COLORS: Record<string, string> = {
  Curiosity: "bg-violet-500/15 text-violet-300",
  Shock: "bg-orange-500/15 text-orange-300",
  POV: "bg-blue-500/15 text-blue-300",
  Contrast: "bg-pink-500/15 text-pink-300",
  Story: "bg-emerald-500/15 text-emerald-300",
  Question: "bg-cyan-500/15 text-cyan-300",
}

function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  return days
}

export default function ContentCalendar() {
  const today = new Date(2026, 5, 16) // June 16, 2026
  const [year, setYear] = useState(2026)
  const [month, setMonth] = useState(5) // June
  const [selectedDay, setSelectedDay] = useState<number | null>(16)
  const [generating, setGenerating] = useState(false)

  const days = generateCalendarDays(year, month)

  const prev = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }
  const next = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  const selectedKey = selectedDay
    ? `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    : null
  const selectedContent = selectedKey ? CONTENT[selectedKey] || [] : []

  const totalScheduled = Object.keys(CONTENT).filter(k => k.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)).length

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-5 h-5 text-violet-400" />
            <h1 className="text-xl font-bold text-white">Content Calendar</h1>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
              {totalScheduled} posts this month
            </span>
          </div>
          <p className="text-sm text-gray-500">Auto-filled by /script with hooks and content angles</p>
        </div>
        <button
          onClick={() => { setGenerating(true); setTimeout(() => setGenerating(false), 2000) }}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-violet-900/30 disabled:opacity-70"
        >
          <Sparkles className={cn("w-4 h-4", generating && "animate-spin")} />
          {generating ? "Generating..." : "Fill with AI"}
        </button>
      </div>

      <div className="flex gap-5">
        {/* Calendar */}
        <div className="flex-1">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prev} className="p-2 rounded-xl hover:bg-[#1a1a2a] text-gray-400 hover:text-white transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-bold text-white">
              {MONTH_NAMES[month]} {year}
            </h2>
            <button onClick={next} className="p-2 rounded-xl hover:bg-[#1a1a2a] text-gray-400 hover:text-white transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} className="text-center text-[11px] font-semibold text-gray-600 uppercase tracking-wide py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />
              const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
              const events = CONTENT[key] || []
              const isToday = year === 2026 && month === 5 && day === 16
              const isSelected = selectedDay === day

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={cn(
                    "aspect-square rounded-xl border text-sm font-medium transition-all relative flex flex-col items-center pt-2 pb-1 gap-1",
                    isSelected
                      ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                      : isToday
                      ? "bg-violet-600/15 border-violet-600/30 text-violet-300"
                      : events.length > 0
                      ? "bg-[#111119] border-[#1f1f2e] text-gray-200 hover:border-violet-500/30"
                      : "bg-[#0d0d16] border-[#1a1a2a] text-gray-500 hover:border-[#1f1f2e]"
                  )}
                >
                  <span className={cn("text-xs", isToday && "w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-white text-[11px] font-bold")}>
                    {isToday ? day : day}
                  </span>
                  {/* Event dots */}
                  {events.length > 0 && (
                    <div className="flex items-center gap-0.5 flex-wrap justify-center px-1">
                      {events.slice(0, 3).map((e, ei) => (
                        <div
                          key={ei}
                          className={cn("w-1.5 h-1.5 rounded-full", TYPE_COLORS[e.type] || "bg-gray-500")}
                        />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4">
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className={cn("w-2 h-2 rounded-full", color)} />
                <span className="text-xs text-gray-500 capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="w-72 flex-shrink-0">
          {selectedDay ? (
            <div className="bg-[#111119] border border-[#1f1f2e] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">
                  {MONTH_NAMES[month]} {selectedDay}
                </h3>
                <button
                  className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </div>

              {selectedContent.length > 0 ? (
                <div className="space-y-3">
                  {selectedContent.map((item, i) => (
                    <div key={i} className="bg-[#0d0d16] border border-[#1a1a2a] rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn("w-2 h-2 rounded-full", TYPE_COLORS[item.type])} />
                        <span className={cn("text-xs font-semibold", PLATFORM_COLORS[item.platform])}>
                          {item.platform}
                        </span>
                        <span className="text-[11px] text-gray-600 capitalize">{item.type}</span>
                      </div>
                      <p className="text-sm text-gray-200 mb-2">{item.title}</p>
                      <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", HOOK_COLORS[item.hook])}>
                        {item.hook} Hook
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarDays className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-3">No content scheduled</p>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-500/15 text-violet-400 text-xs font-medium hover:bg-violet-500/20 transition-colors mx-auto">
                    <Sparkles className="w-3 h-3" />
                    Generate for this day
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#111119] border border-[#1f1f2e] rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Monthly Overview</h3>
              <div className="space-y-3">
                {[
                  { label: "Reels", count: 7, color: "bg-violet-500" },
                  { label: "Posts", count: 3, color: "bg-blue-500" },
                  { label: "Stories", count: 2, color: "bg-pink-500" },
                  { label: "Shorts", count: 1, color: "bg-orange-500" },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={cn("w-2.5 h-2.5 rounded-full", color)} />
                    <span className="text-sm text-gray-300 flex-1">{label}</span>
                    <span className="text-sm font-semibold text-white">{count}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-[#1a1a2a]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total scheduled</span>
                    <span className="text-sm font-bold text-violet-400">13 posts</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <p className="text-xs text-violet-300 font-medium mb-1">Tip from /script</p>
                <p className="text-xs text-gray-400">Best days to post: Tue, Thu, Sun at 9am or 6pm based on your audience data.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
