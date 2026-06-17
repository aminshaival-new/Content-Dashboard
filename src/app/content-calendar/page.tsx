"use client"

import { useState, useMemo, useEffect } from "react"
import {
  CalendarDays, ChevronLeft, ChevronRight, Sparkles, Clock,
  Instagram, Youtube, Music2, Copy, Check, ArrowLeft, FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { postsStore, type StoredPost } from "@/lib/store"

// ─── Types ────────────────────────────────────────────────────────────────────

type Platform = "Instagram" | "TikTok" | "YouTube Shorts"

type CalendarPost = {
  id: string
  date: string
  time: string
  platforms: Platform[]
  hookText: string
  hookType: string
  script: { hook: string; body1: string; body2: string; body3?: string; cta: string }
  captions: Partial<Record<Platform, string>>
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]
const PLATFORMS: Platform[] = ["Instagram", "TikTok", "YouTube Shorts"]

const PLATFORM_META: Record<Platform, { color: string; icon: React.ElementType }> = {
  "Instagram":      { color: "text-pink-400", icon: Instagram },
  "TikTok":         { color: "text-cyan-400", icon: Music2 },
  "YouTube Shorts": { color: "text-red-400",  icon: Youtube },
}

const HOOK_BADGE: Record<string, string> = {
  POV:       "bg-blue-500/15 text-blue-300 border-blue-500/20",
  Shock:     "bg-orange-500/15 text-orange-300 border-orange-500/20",
  Contrast:  "bg-pink-500/15 text-pink-300 border-pink-500/20",
  Story:     "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  Listicle:  "bg-yellow-500/15 text-yellow-300 border-yellow-500/20",
  Question:  "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
  Curiosity: "bg-violet-500/15 text-violet-300 border-violet-500/20",
}

const HOOK_CHIP: Record<string, string> = {
  POV:       "border-l-blue-500 bg-blue-500/10",
  Shock:     "border-l-orange-500 bg-orange-500/10",
  Contrast:  "border-l-pink-500 bg-pink-500/10",
  Story:     "border-l-emerald-500 bg-emerald-500/10",
  Listicle:  "border-l-yellow-500 bg-yellow-500/10",
  Question:  "border-l-cyan-500 bg-cyan-500/10",
  Curiosity: "border-l-violet-500 bg-violet-500/10",
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const POSTS: CalendarPost[] = [
  {
    id: "a", date: "2026-06-01", time: "9:00 AM",
    platforms: ["Instagram", "TikTok"],
    hookText: "POV: You discovered the AI tool every creator is hiding from you...",
    hookType: "POV",
    script: {
      hook: "POV: You discovered the AI tool every creator is hiding from you...",
      body1: "Here's what most people don't know: the top 1% of creators aren't posting more — they're posting smarter. They have a system that turns one idea into 10 pieces of content in under an hour.",
      body2: "I've been using this workflow for 3 months. My output went from 5 posts/week to 30 — same time investment. Template-based hooks + AI-assisted scripting + batch scheduling.",
      body3: "The counterintuitive part? Less ideation time = better content. Constraints force creativity. When you have a framework, you stop staring at a blank screen.",
      cta: "Save this for your next content batch day. Drop a 🔥 if this changed how you think about creating.",
    },
    captions: {
      Instagram: "POV: You discovered the AI tool every creator is hiding from you...\n\nTop 1% of creators post smarter, not more. Here's the system.\n\nSave this for your next batch day 👇\n\n#contentcreator #reels #instagramreels #growthhacks #creatortips",
      TikTok: "POV: You discovered the AI tool every creator is hiding from you...\n\nOne idea → 10 pieces of content in under an hour. Here's how.\n\nSave this! 🔥 #tiktokgrowth #fyp #foryou #contentcreator #viral",
    },
  },
  {
    id: "b", date: "2026-06-03", time: "2:00 PM",
    platforms: ["Instagram", "TikTok", "YouTube Shorts"],
    hookText: "Nobody tells beginners this about the algorithm — and it's costing you views",
    hookType: "Shock",
    script: {
      hook: "Nobody tells beginners this about the algorithm — and it's costing you views",
      body1: "The algorithm doesn't care about your follower count. It cares about completion rate, saves, and shares — in that order. If people aren't watching your full video, you're invisible.",
      body2: "I ran a test: same content, two hooks. Hook A got 12% completion. Hook B got 67%. One word change = 5x the reach.",
      cta: "Test this on your next post and comment what happens. Follow for the full breakdown.",
    },
    captions: {
      Instagram: "Nobody tells beginners this about the algorithm — and it's costing you views 🔥\n\nCompletion rate > follower count. Always.\n\n#contentcreator #reels #instagramreels #growthhacks #creatortips",
      TikTok: "Nobody tells beginners this about the algorithm 🔥\n\nCompletion rate is everything. Here's why.\n\n#tiktokgrowth #fyp #foryou #contentcreator #viral",
      "YouTube Shorts": "Nobody tells beginners this about the algorithm.\n\n#shorts #youtubeshorts #viral",
    },
  },
  {
    id: "c", date: "2026-06-05", time: "9:00 AM",
    platforms: ["TikTok"],
    hookText: "[NUMBER] things I wish I knew before starting my creator journey",
    hookType: "Listicle",
    script: {
      hook: "[NUMBER] things I wish I knew before starting my creator journey",
      body1: "Number 1: Your first 100 posts will be bad. Post them anyway. Every creator you admire has a graveyard of terrible content. The difference is they kept going.",
      body2: "Number 2: Consistency beats quality in year one. The algorithm rewards people who show up. One post a day for 90 days will teach you more than any course.",
      body3: "Number 3: Study hooks obsessively. The first 2 seconds decide everything. I have 200 hooks saved and I read them before every recording session.",
      cta: "Follow if you want the full list. Dropping one per week for the next month.",
    },
    captions: {
      TikTok: "Things I wish I knew before starting my creator journey 👇\n\n1. Your first 100 posts will be bad — post them anyway\n2. Consistency > quality in year 1\n3. Study hooks obsessively\n\nFollow for the full list #tiktokgrowth #fyp #foryou #contentcreator #viral",
    },
  },
  {
    id: "d", date: "2026-06-08", time: "11:00 AM",
    platforms: ["Instagram"],
    hookText: "The hook formula that 10x'd my views — I shouldn't be sharing this",
    hookType: "Curiosity",
    script: {
      hook: "The hook formula that 10x'd my views — I shouldn't be sharing this",
      body1: "Every high-performing hook has three elements: a tension word (stop, never, nobody, secret), a specific promise (not 'more views' — '10x views'), and a reason to watch NOW.",
      body2: "I analyzed 500 viral reels and the pattern is identical. Open a loop, make a bold claim, or speak directly to a pain. Every time.",
      body3: "The formula: [Tension word] + [Specific claim] + [Urgency]. Sounds simple but 90% of creators skip the tension word and wonder why nobody watches.",
      cta: "Save this and use the formula on your next 3 hooks. Report back what happened.",
    },
    captions: {
      Instagram: "The hook formula that 10x'd my views — I shouldn't be sharing this 👀\n\nEvery viral hook has 3 elements:\n→ Tension word (stop, never, nobody)\n→ Specific promise (not vague)\n→ Urgency or exclusivity\n\nSave this. Use it. Report back 👇\n\n#contentcreator #reels #instagramreels #growthhacks #creatortips",
    },
  },
  {
    id: "e", date: "2026-06-10", time: "6:00 PM",
    platforms: ["Instagram", "TikTok"],
    hookText: "Stop posting at random times if you actually want to grow",
    hookType: "Contrast",
    script: {
      hook: "Stop posting at random times if you actually want to grow",
      body1: "Data from my last 90 posts: reels posted between 8–10am and 6–8pm get 3x more reach in the first hour. That first-hour velocity tells the algorithm to push your content.",
      body2: "The trap: posting at 'peak' times means competing with thousands of other creators. The real edge? Post 30 minutes BEFORE peak — your content is already warm when the wave hits.",
      cta: "Try posting at 8:30am or 5:30pm for 2 weeks and track your reach. Let me know the results.",
    },
    captions: {
      Instagram: "Stop posting at random times if you actually want to grow 📈\n\nData from 90 posts: 8–10am and 6–8pm = 3x reach in the first hour.\n\nPost 30 min BEFORE peak. 👇\n\n#contentcreator #reels #instagramreels #growthhacks #creatortips",
      TikTok: "Stop posting at random times if you want to grow 📈\n\nPost 30 minutes BEFORE peak — that's the actual trick.\n\n#tiktokgrowth #fyp #foryou #contentcreator #viral",
    },
  },
  {
    id: "f", date: "2026-06-12", time: "9:00 AM",
    platforms: ["Instagram", "YouTube Shorts"],
    hookText: "I batched 30 pieces of content in one day — here's the exact system",
    hookType: "Story",
    script: {
      hook: "I batched 30 pieces of content in one day — here's the exact system",
      body1: "7am: Ideation block. 6 hooks from the vault × 5 variations = 30 ideas in under an hour. No creativity required — just pattern recognition.",
      body2: "9am: Recording block. One outfit, one background, one lighting setup. 6 hero videos + 4 quick talking-head clips. Done by noon.",
      body3: "1pm: Editing block. Template-based editing means each clip takes 8 minutes. Same transitions, same caption style, same music. Batch done by 4pm.",
      cta: "Screenshot this and try it on your next batch day. Tag me so I can see your results.",
    },
    captions: {
      Instagram: "I batched 30 pieces of content in one day — here's the exact system 🎬\n\n7am → 30 ideas (6 hooks × 5 formats)\n9am → Record 10 clips\n1pm → Edit (8 min/clip)\n\nScreenshot this 👇\n\n#contentcreator #reels #instagramreels #growthhacks #creatortips",
      "YouTube Shorts": "I batched 30 pieces of content in one day. Here's the system.\n\n#shorts #youtubeshorts #viral",
    },
  },
  {
    id: "g", date: "2026-06-15", time: "9:00 AM",
    platforms: ["Instagram", "TikTok"],
    hookText: "I quit my 9-5 to test this business model for 30 days. Here's what happened...",
    hookType: "Story",
    script: {
      hook: "I quit my 9-5 to test this business model for 30 days. Here's what happened...",
      body1: "Day 1–7: $0. Pure content creation. Building the library. By day 7, one video hit 200K views. The DMs started.",
      body2: "Day 8–20: First sales from the 200K video. Product wasn't even ready — I was selling a waitlist. 47 people paid $97. That's $4,559 from one reel.",
      body3: "Day 21–30: Built the product while fulfilling orders. Revenue hit $18K. The model works. The variable is content quality and consistency.",
      cta: "Follow for the month-by-month breakdown. Part 2 drops this week.",
    },
    captions: {
      Instagram: "I quit my 9-5 to test this business model for 30 days 👇\n\nDay 1–7: $0\nDay 8–20: $4,559 from one viral reel\nDay 21–30: $18K total\n\nFollow for the full breakdown 🔥\n\n#contentcreator #reels #instagramreels #growthhacks #creatortips",
      TikTok: "I quit my 9-5 to test this for 30 days 🔥\n\nDay 1–7: $0\nDay 8–20: $4,559 from one reel\nDay 21–30: $18K total\n\nFollow for part 2 #tiktokgrowth #fyp #foryou #contentcreator #viral",
    },
  },
  {
    id: "h", date: "2026-06-17", time: "9:00 AM",
    platforms: ["Instagram", "TikTok"],
    hookText: "POV: You just discovered the content framework that changes everything...",
    hookType: "POV",
    script: {
      hook: "POV: You just discovered the content framework that changes everything...",
      body1: "Most creators batch content wrong — they try to create 30 different ideas. The framework: create one foundational piece, then reformat it 5 ways. Same insight, 5 platforms, 5 audiences.",
      body2: "I tested this for 60 days across 200 pieces of content. 40% less time spent creating, 60% more reach. Here's the exact reformatting system I use every batch day.",
      cta: "Save this for when you start your next batch day.",
    },
    captions: {
      Instagram: "POV: You just discovered the content framework that changes everything...\n\nCreate one piece. Reformat it 5 ways. 40% less time, 60% more reach.\n\nSave this 👇\n\n#contentcreator #reels #instagramreels #growthhacks #creatortips",
      TikTok: "POV: You just discovered the content framework that changes everything...\n\nOne piece. 5 formats. Less time, more reach.\n\nSave this! #tiktokgrowth #fyp #foryou #contentcreator #viral",
    },
  },
  {
    id: "i", date: "2026-06-17", time: "2:00 PM",
    platforms: ["YouTube Shorts"],
    hookText: "The one metric that predicts viral potential — most creators ignore it",
    hookType: "Curiosity",
    script: {
      hook: "The one metric that predicts viral potential — most creators ignore it",
      body1: "It's not views. Not likes. It's the saves-to-views ratio. When more than 10% of viewers save your content, the algorithm reads it as 'this is worth revisiting' and pushes it to cold audiences.",
      body2: "I tracked this across 150 posts. Every post that went viral had a saves rate above 8%. Every flopping post was under 2%. The difference: no 'reference value' — nothing to save and come back to.",
      cta: "Check your saves rate right now. If it's under 5%, your next hook should be a listicle or framework.",
    },
    captions: {
      "YouTube Shorts": "The one metric that predicts viral potential — most creators ignore it.\n\n#shorts #youtubeshorts #viral",
    },
  },
  {
    id: "j", date: "2026-06-22", time: "9:00 AM",
    platforms: ["Instagram", "TikTok", "YouTube Shorts"],
    hookText: "Nobody tells beginners this about the algorithm",
    hookType: "Shock",
    script: {
      hook: "Nobody tells beginners this about the algorithm",
      body1: "The algorithm isn't looking for good content. It's looking for content that makes people stay. 80% of what you see on your feed is from people you don't follow — the algorithm betting on strangers.",
      body2: "Your job as a creator isn't to make art. It's to make people finish watching. Every second they watch is a vote that tells the algorithm to push it further.",
      cta: "Drop a 🔥 if this hit different.",
    },
    captions: {
      Instagram: "Nobody tells beginners this about the algorithm 🔥\n\nThe algorithm isn't looking for good content. It's looking for content that makes people STAY.\n\nDrop a 🔥 if this hit different 👇\n\n#contentcreator #reels #instagramreels #growthhacks #creatortips",
      TikTok: "Nobody tells beginners this about the algorithm 🔥\n\nYour job: make people finish watching. Every second = a vote.\n\n#tiktokgrowth #fyp #foryou #contentcreator #viral",
      "YouTube Shorts": "Nobody tells beginners this about the algorithm.\n\n#shorts #youtubeshorts #viral",
    },
  },
  {
    id: "k", date: "2026-06-24", time: "6:00 PM",
    platforms: ["Instagram"],
    hookText: "Stop doing this one thing if you want to grow on social media...",
    hookType: "Contrast",
    script: {
      hook: "Stop doing this one thing if you want to grow on social media...",
      body1: "Chasing trends. Trend-based content averages 45% lower profile visits than original content. You get the views but not the followers — because trend content is about the trend, not about you.",
      body2: "The creators with the best follower-to-view ratio have a clear POV. People follow people, not content. When your content could be from anyone, it won't grow your account even if it goes viral.",
      cta: "Save this and test it: next 10 posts, no trends. See what happens to your follow rate.",
    },
    captions: {
      Instagram: "Stop doing this one thing if you want to grow on social media... 🚫\n\nChasing trends. You get views but not followers.\n\nTest: 10 posts, no trends. Track your follow rate 👇\n\n#contentcreator #reels #instagramreels #growthhacks #creatortips",
    },
  },
  {
    id: "l", date: "2026-06-26", time: "9:00 AM",
    platforms: ["TikTok"],
    hookText: "The secret that took me from 0 to 100K followers in 6 months",
    hookType: "Story",
    script: {
      hook: "The secret that took me from 0 to 100K followers in 6 months",
      body1: "Month 1: I posted 30 times. 29 flopped. One hit 800K views. That one video taught me more about my audience than any course. I doubled down on that format.",
      body2: "Month 2–4: Reverse-engineered the 800K video. Same hook structure, same pacing. Posted 3x/week. Every 5th video hit above 100K. Consistency created a baseline.",
      body3: "Month 5–6: The algorithm started trusting me. Average went from 5K to 40K per video. Month 6: 100K followers and a waitlist of 200 for my first product.",
      cta: "Follow for the month-by-month strategy. Breaking it down in detail this week.",
    },
    captions: {
      TikTok: "The secret that took me from 0 to 100K in 6 months 🔥\n\nMonth 1: 30 posts, one 800K hit\nMonth 2–4: Doubled down, built baseline\nMonth 5–6: Algorithm trusted me, 100K\n\nFollow for the full breakdown #tiktokgrowth #fyp #foryou #contentcreator #viral",
    },
  },
  {
    id: "m", date: "2026-06-29", time: "10:00 AM",
    platforms: ["Instagram", "TikTok"],
    hookText: "If you're a creator under 10K followers, read this before posting again",
    hookType: "Question",
    script: {
      hook: "If you're a creator under 10K followers, read this before posting again",
      body1: "The biggest mistake: optimizing for likes instead of saves. Likes are passive. Saves mean someone thought 'I'll need this later' — the highest-intent engagement signal the algorithm sees.",
      body2: "Every post should have 'save value.' Frameworks, checklists, step-by-step systems, counterintuitive insights — anything worth revisiting. If someone wouldn't save it, rethink the format.",
      cta: "Comment 'saves' and I'll send you my checklist for making every post save-worthy.",
    },
    captions: {
      Instagram: "If you're a creator under 10K followers, read this before posting again 👀\n\nOptimize for SAVES not likes.\n\nComment 'saves' for my checklist 👇\n\n#contentcreator #reels #instagramreels #growthhacks #creatortips",
      TikTok: "If you're under 10K followers, watch this 👀\n\nStop chasing likes. Optimize for saves.\n\nComment 'saves' for the full checklist #tiktokgrowth #fyp #foryou #contentcreator #viral",
    },
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pad(n: number) { return String(n).padStart(2, "0") }

function storedToCalendar(p: StoredPost): CalendarPost {
  const dt = new Date(p.scheduledAt)
  const date = p.scheduledAt.slice(0, 10)
  const h = dt.getHours()
  const mins = dt.getMinutes()
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  const time = `${h12}:${pad(mins)} ${ampm}`
  return {
    id: p.id,
    date,
    time,
    platforms: p.platforms as Platform[],
    hookText: p.hookText,
    hookType: p.hookType || "Shock",
    script: { hook: p.hookText, body1: p.angle || "", body2: "", cta: p.cta || "" },
    captions: p.captions as Partial<Record<Platform, string>>,
  }
}

function buildCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (number | null)[] = Array(firstDay).fill(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  while (days.length % 7 !== 0) days.push(null)
  return days
}

// ─── Small components ─────────────────────────────────────────────────────────

function PlatformIcon({ platform, size = "xs" }: { platform: Platform; size?: "sm" | "xs" | "xxs" }) {
  const { icon: Icon, color } = PLATFORM_META[platform]
  return (
    <Icon className={cn(
      color,
      size === "sm" ? "w-3.5 h-3.5" : size === "xs" ? "w-3 h-3" : "w-2.5 h-2.5"
    )} />
  )
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      className={cn(
        "flex items-center gap-1 text-[10px] transition-colors",
        copied ? "text-emerald-400" : "text-gray-600 hover:text-gray-400"
      )}
    >
      {copied ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

// ─── Side panel: script + caption detail ─────────────────────────────────────

function ScriptPanel({ post, onBack }: { post: CalendarPost; onBack: () => void }) {
  const [captionTab, setCaptionTab] = useState<Platform>(post.platforms[0])

  const sections = [
    { label: "Hook",           text: post.script.hook },
    { label: "Body — Point 1", text: post.script.body1 },
    { label: "Body — Point 2", text: post.script.body2 },
    ...(post.script.body3 ? [{ label: "Body — Point 3", text: post.script.body3 }] : []),
    { label: "CTA",            text: post.script.cta },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <button
          onClick={onBack}
          className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
          {post.platforms.map(p => <PlatformIcon key={p} platform={p} size="xs" />)}
          <span className="text-xs text-gray-500">{post.time}</span>
        </div>
        <span className={cn(
          "text-[10px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0",
          HOOK_BADGE[post.hookType] || "bg-gray-500/15 text-gray-400 border-gray-500/20"
        )}>
          {post.hookType}
        </span>
      </div>

      {/* Hook preview */}
      <p className="text-xs font-semibold text-gray-200 leading-relaxed mb-4 flex-shrink-0 font-mono">
        {post.hookText}
      </p>

      <div className="overflow-y-auto flex-1 space-y-4 pr-0.5">
        {/* Script sections */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <FileText className="w-3 h-3 text-violet-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Script</span>
          </div>
          <div className="space-y-2">
            {sections.map(({ label, text }) => (
              <div key={label} className="bg-[#0a0a12] border border-[#1a1a28] rounded-xl p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-bold text-gray-600 uppercase tracking-wider">{label}</span>
                  <CopyBtn text={text} />
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Captions */}
        <div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Caption</span>

          {post.platforms.length > 1 && (
            <div className="flex gap-1 mt-2 mb-2">
              {post.platforms.map(p => (
                <button
                  key={p}
                  onClick={() => setCaptionTab(p)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border transition-all",
                    captionTab === p
                      ? "bg-[#1a1a2a] border-[#2a2a3e] text-white"
                      : "border-transparent text-gray-500 hover:text-gray-300"
                  )}
                >
                  <PlatformIcon platform={p} size="xxs" />
                  {p === "YouTube Shorts" ? "YT" : p === "Instagram" ? "IG" : "TT"}
                </button>
              ))}
            </div>
          )}

          {post.platforms.map(p => {
            const caption = post.captions[p] || ""
            return (
              <div key={p} className={cn("mt-2", captionTab === p ? "block" : "hidden")}>
                <div className="bg-[#0a0a12] border border-[#1a1a28] rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1a1a28]">
                    <div className="flex items-center gap-1.5">
                      <PlatformIcon platform={p} size="xxs" />
                      <span className={cn("text-[10px] font-medium", PLATFORM_META[p].color)}>{p}</span>
                    </div>
                    <CopyBtn text={caption} />
                  </div>
                  <pre className="px-3 py-2.5 text-[11px] text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
                    {caption || <span className="text-gray-600 italic">No caption</span>}
                  </pre>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Side panel: day posts list ───────────────────────────────────────────────

function DayPanel({
  date,
  posts,
  onSelectPost,
}: {
  date: string
  posts: CalendarPost[]
  onSelectPost: (p: CalendarPost) => void
}) {
  const d = new Date(date + "T12:00:00")
  const label = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })

  return (
    <div className="flex flex-col h-full">
      <div className="mb-3 flex-shrink-0">
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {posts.length > 0 ? `${posts.length} post${posts.length !== 1 ? "s" : ""} scheduled` : "Nothing scheduled"}
        </p>
      </div>

      {posts.length > 0 ? (
        <div className="space-y-2 overflow-y-auto flex-1">
          {posts.map(post => (
            <button
              key={post.id}
              onClick={() => onSelectPost(post)}
              className="w-full text-left bg-[#0a0a12] border border-[#1a1a28] rounded-xl p-3 hover:border-violet-500/30 transition-all group"
            >
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                  <Clock className="w-2.5 h-2.5" />
                  {post.time}
                </span>
                {post.platforms.map(p => <PlatformIcon key={p} platform={p} size="xs" />)}
                <span className={cn(
                  "ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full border",
                  HOOK_BADGE[post.hookType] || "bg-gray-500/15 text-gray-400 border-gray-500/20"
                )}>
                  {post.hookType}
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-snug line-clamp-2 group-hover:text-white transition-colors">
                {post.hookText}
              </p>
              <p className="text-[10px] text-gray-600 mt-1.5 group-hover:text-violet-400 transition-colors">
                View full script →
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <CalendarDays className="w-6 h-6 text-gray-700 mb-2" />
          <p className="text-xs text-gray-500 mb-3">Nothing scheduled</p>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500/10 text-violet-400 text-xs font-medium hover:bg-violet-500/15 transition-colors">
            <Sparkles className="w-3 h-3" />
            Generate for this day
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Side panel: month overview ───────────────────────────────────────────────

function MonthOverview({ posts, month, year }: { posts: CalendarPost[]; month: number; year: number }) {
  const counts = useMemo(() => {
    const map = { Instagram: 0, TikTok: 0, "YouTube Shorts": 0 } as Record<Platform, number>
    posts.forEach(p => p.platforms.forEach(pl => { map[pl]++ }))
    return map
  }, [posts])

  return (
    <div>
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4">
        {MONTH_NAMES[month]} {year}
      </p>

      <div className="space-y-2.5 mb-4">
        {PLATFORMS.map(p => (
          <div key={p} className="flex items-center gap-2">
            <PlatformIcon platform={p} size="xs" />
            <span className="text-xs text-gray-400 flex-1">{p}</span>
            <span className="text-xs font-semibold text-white">{counts[p]}</span>
          </div>
        ))}
        <div className="pt-3 border-t border-[#1a1a28] flex items-center justify-between">
          <span className="text-xs text-gray-500">Total</span>
          <span className="text-xs font-bold text-violet-400">{posts.length} posts</span>
        </div>
      </div>

      <div className="bg-violet-500/8 border border-violet-500/20 rounded-xl p-3">
        <p className="text-[11px] font-semibold text-violet-300 mb-1">Best times to post</p>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Tue, Thu, Sun · 9:00 AM or 6:00 PM based on your audience data.
        </p>
      </div>

      <p className="text-[11px] text-gray-600 mt-4 text-center">Click any day to see scheduled posts</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContentCalendar() {
  const now = new Date()
  const [year, setYear]           = useState(now.getFullYear())
  const [month, setMonth]         = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null)
  const [allPosts, setAllPosts]   = useState<CalendarPost[]>(POSTS)

  // Load from scheduler localStorage, fall back to hardcoded POSTS
  useEffect(() => {
    const stored = postsStore.list()
    if (stored.length > 0) {
      setAllPosts(stored.map(storedToCalendar))
    }
    // else keep hardcoded POSTS as examples
  }, [])

  const days = useMemo(() => buildCalendarDays(year, month), [year, month])
  const monthKey = `${year}-${pad(month + 1)}`

  const monthPosts = useMemo(
    () => allPosts.filter(p => p.date.startsWith(monthKey)),
    [allPosts, monthKey]
  )

  const postsByDate = useMemo(() => {
    const map: Record<string, CalendarPost[]> = {}
    monthPosts.forEach(p => {
      if (!map[p.date]) map[p.date] = []
      map[p.date].push(p)
      map[p.date].sort((a, b) => a.time.localeCompare(b.time))
    })
    return map
  }, [monthPosts])

  const selectedDayPosts = selectedDate ? postsByDate[selectedDate] || [] : []

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelectedDate(null); setSelectedPost(null)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelectedDate(null); setSelectedPost(null)
  }

  const handleDayClick = (key: string) => {
    setSelectedDate(prev => prev === key ? null : key)
    setSelectedPost(null)
  }

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <CalendarDays className="w-5 h-5 text-violet-400" />
          <h1 className="text-xl font-bold text-white">Content Calendar</h1>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
            {monthPosts.length} this month
          </span>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-violet-900/30">
          <Sparkles className="w-4 h-4" />
          Fill with AI
        </button>
      </div>

      <div className="flex gap-4 items-start">
        {/* Calendar */}
        <div className="flex-1 min-w-0">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-[#1a1a2a] text-gray-400 hover:text-white transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-white">{MONTH_NAMES[month]} {year}</span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-[#1a1a2a] text-gray-400 hover:text-white transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS_OF_WEEK.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-gray-600 uppercase tracking-wide py-1.5">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (!day) return <div key={`e${i}`} className="min-h-[100px]" />
              const key = `${year}-${pad(month + 1)}-${pad(day)}`
              const posts = postsByDate[key] || []
              const isToday = year === 2026 && month === 5 && day === 16
              const isSelected = selectedDate === key

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(key)}
                  className={cn(
                    "min-h-[100px] flex flex-col items-start p-1.5 rounded-xl border text-left transition-all overflow-hidden",
                    isSelected
                      ? "bg-violet-500/15 border-violet-500/40"
                      : posts.length > 0
                      ? "bg-[#111119] border-[#1f1f2e] hover:border-violet-500/25"
                      : "bg-[#0a0a12] border-[#1a1a2a] hover:border-[#1f1f2e]"
                  )}
                >
                  <span className={cn(
                    "text-[11px] font-bold mb-1 w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0",
                    isToday
                      ? "bg-violet-600 text-white text-[10px]"
                      : isSelected
                      ? "text-violet-300"
                      : posts.length > 0
                      ? "text-gray-300"
                      : "text-gray-600"
                  )}>
                    {day}
                  </span>

                  <div className="w-full space-y-0.5">
                    {posts.slice(0, 2).map(post => (
                      <div
                        key={post.id}
                        onClick={e => {
                          e.stopPropagation()
                          setSelectedDate(key)
                          setSelectedPost(post)
                        }}
                        className={cn(
                          "w-full px-1.5 py-0.5 rounded border-l-2 cursor-pointer transition-opacity hover:opacity-80",
                          HOOK_CHIP[post.hookType] || "border-l-gray-500 bg-gray-500/10"
                        )}
                      >
                        <div className="flex items-center gap-0.5 mb-px">
                          <span className="text-[8px] text-gray-500 font-medium leading-none">{post.time}</span>
                          {post.platforms.slice(0, 2).map(p => {
                            const { icon: Icon, color } = PLATFORM_META[p]
                            return <Icon key={p} className={cn("w-2 h-2 flex-shrink-0", color)} />
                          })}
                        </div>
                        <p className="text-[9px] text-gray-300 leading-tight truncate">{post.hookText}</p>
                      </div>
                    ))}
                    {posts.length > 2 && (
                      <p className="text-[8px] text-gray-600 px-1">+{posts.length - 2} more</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3">
            {PLATFORMS.map(p => {
              const { icon: Icon, color } = PLATFORM_META[p]
              return (
                <div key={p} className="flex items-center gap-1">
                  <Icon className={cn("w-3 h-3", color)} />
                  <span className="text-[11px] text-gray-600">{p === "YouTube Shorts" ? "YT Shorts" : p}</span>
                </div>
              )
            })}
            <div className="flex items-center gap-1 ml-auto">
              <div className="w-2 h-2 rounded-full bg-violet-600" />
              <span className="text-[11px] text-gray-600">Today</span>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="w-[300px] flex-shrink-0 sticky top-6 bg-[#111119] border border-[#1f1f2e] rounded-2xl p-4 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
          {selectedPost ? (
            <ScriptPanel post={selectedPost} onBack={() => setSelectedPost(null)} />
          ) : selectedDate ? (
            <DayPanel
              date={selectedDate}
              posts={selectedDayPosts}
              onSelectPost={p => setSelectedPost(p)}
            />
          ) : (
            <MonthOverview posts={monthPosts} month={month} year={year} />
          )}
        </div>
      </div>
    </div>
  )
}
