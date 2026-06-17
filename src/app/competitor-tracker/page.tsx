"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import {
  Users, Plus, RefreshCw, BookMarked, Check, ExternalLink,
  Mic, Monitor, FileText, ChevronDown, ChevronUp, X, Clock, Zap, CalendarDays, Loader2,
} from "lucide-react"
import { cn, formatNum } from "@/lib/utils"
import { hooksStore, StoredHook } from "@/lib/store"

// ─── Types ────────────────────────────────────────────────────────────────────

type Account = {
  id: number
  name: string
  handle: string
  followers: number
  followersLabel: string
  initials: string
  color: string              // tailwind bg class
  platform: string
  niche: string
}

type ReelCard = {
  id: number
  accountId: number
  views: number
  viewsLabel: string
  postedDate: string
  hookType: string
  hook: string               // transcribed spoken hook — first 2 sentences of audio
  onScreenText: string       // OCR'd text visible on screen
  transcript: string         // full transcription excerpt (~3 sentences)
  url?: string               // direct link to the reel/post
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

const ACCOUNTS: Account[] = [
  { id: 1, name: "Alex Hormozi",    handle: "@AlexHormozi",  followers: 4200000, followersLabel: "4.2M", initials: "AH", color: "bg-orange-500",  platform: "Instagram", niche: "Business" },
  { id: 2, name: "Lara Acosta",     handle: "@lara.acosta_", followers: 890000,  followersLabel: "890K", initials: "LA", color: "bg-pink-500",    platform: "Instagram", niche: "Creator Economy" },
  { id: 3, name: "Gary Vaynerchuk", handle: "@garyvee",      followers: 9800000, followersLabel: "9.8M", initials: "GV", color: "bg-green-600",   platform: "Instagram", niche: "Marketing" },
  { id: 4, name: "Justin Welsh",    handle: "@JustinWelsh",  followers: 520000,  followersLabel: "520K", initials: "JW", color: "bg-blue-500",    platform: "LinkedIn",  niche: "Solopreneur" },
  { id: 5, name: "Dakota Robertson",handle: "@WrongsToWrite",followers: 340000,  followersLabel: "340K", initials: "DR", color: "bg-violet-500",  platform: "Twitter",   niche: "Writing" },
  { id: 6, name: "Andrew Huberman", handle: "@hubermanlab",  followers: 5100000, followersLabel: "5.1M", initials: "AP", color: "bg-sky-700",     platform: "Instagram", niche: "Health/Science" },
  { id: 7, name: "Chris Williamson",handle: "@chriswillx",   followers: 1200000, followersLabel: "1.2M", initials: "CW", color: "bg-slate-600",  platform: "Instagram", niche: "Mindset" },
  { id: 8, name: "Ali Abdaal",      handle: "@aliabdaal",    followers: 4700000, followersLabel: "4.7M", initials: "AA", color: "bg-teal-600",   platform: "YouTube",   niche: "Productivity" },
]

function profileUrl(account: Account): string {
  const h = account.handle.replace(/^@/, "")
  switch (account.platform) {
    case "Instagram": return `https://www.instagram.com/${h}/reels/`
    case "TikTok":    return `https://www.tiktok.com/@${h}`
    case "YouTube":   return `https://www.youtube.com/@${h}`
    case "Twitter":   return `https://twitter.com/${h}`
    case "LinkedIn":  return `https://www.linkedin.com/in/${h}`
    default:          return `https://www.instagram.com/${h}/`
  }
}

// ─── Reels (5 per account, all scraped this week) ─────────────────────────────

const REELS: ReelCard[] = [
  // ── Alex Hormozi ──
  {
    id: 1, accountId: 1, views: 8400000, viewsLabel: "8.4M", postedDate: "Jun 14", hookType: "Listicle",
    hook: "Seven things I wish I knew before I built a business. Number one — nobody's going to save you.",
    onScreenText: "7 THINGS I WISH I KNEW 🔥",
    transcript: "Seven things I wish I knew before I built a business. Number one — nobody's going to save you, not your parents, not the government, not some mentor. You are fully responsible for your outcomes and the sooner you accept that, the faster you move.",
  },
  {
    id: 2, accountId: 1, views: 5100000, viewsLabel: "5.1M", postedDate: "Jun 12", hookType: "Shock",
    hook: "The four-hour work week is the most dangerous lie in entrepreneurship.",
    onScreenText: "4HR WORK WEEK = COPE",
    transcript: "The four-hour work week is the most dangerous lie in entrepreneurship. It told an entire generation that success should feel easy, and now we have millions of people quitting every time something gets hard.",
  },
  {
    id: 3, accountId: 1, views: 3700000, viewsLabel: "3.7M", postedDate: "Jun 10", hookType: "Contrast",
    hook: "Stop hiring people until you've done this one thing first.",
    onScreenText: "HIRING MISTAKE #1",
    transcript: "Stop hiring people until you've done this one thing first. Most founders hire to escape discomfort, not because they've maximized their own output. If you can't document the role, you shouldn't fill it.",
  },
  {
    id: 4, accountId: 1, views: 2800000, viewsLabel: "2.8M", postedDate: "Jun 8", hookType: "Story",
    hook: "I bought a gym that was losing two hundred thousand dollars a year and I'm going to show you exactly what I did.",
    onScreenText: "I LOST $200K ON A GYM",
    transcript: "I bought a gym that was losing two hundred thousand dollars a year and I'm going to show you exactly what I did. Most people would have sold it. I did the opposite — I went in, I fired half the staff, and I restructured the entire offer.",
  },
  {
    id: 5, accountId: 1, views: 1900000, viewsLabel: "1.9M", postedDate: "Jun 6", hookType: "Curiosity",
    hook: "The reason most businesses fail in year three has nothing to do with the market.",
    onScreenText: "WHY BUSINESSES DIE IN YEAR 3",
    transcript: "The reason most businesses fail in year three has nothing to do with the market. It has everything to do with the founder losing hunger. Year one you're starving. Year two you're surviving. Year three you get comfortable — and that's the death zone.",
  },

  // ── Lara Acosta ──
  {
    id: 6, accountId: 2, views: 3100000, viewsLabel: "3.1M", postedDate: "Jun 15", hookType: "Story",
    hook: "I went from zero to five hundred thousand followers on Instagram while I was still working a nine-to-five.",
    onScreenText: "0 → 500K WHILE WORKING 9–5",
    transcript: "I went from zero to five hundred thousand followers on Instagram while I was still working a nine-to-five. I had forty-five minutes in the morning, forty-five minutes at night, and Sundays. That was my entire content window.",
  },
  {
    id: 7, accountId: 2, views: 1800000, viewsLabel: "1.8M", postedDate: "Jun 13", hookType: "Contrast",
    hook: "Stop posting every single day on Instagram. Here's the data that made me completely change my mind.",
    onScreenText: "POSTING EVERY DAY = BAD IDEA",
    transcript: "Stop posting every single day on Instagram. Here's the data that made me completely change my mind. When I dropped from seven posts a week to three, my average reach per post went up two hundred and forty percent.",
  },
  {
    id: 8, accountId: 2, views: 1200000, viewsLabel: "1.2M", postedDate: "Jun 11", hookType: "Shock",
    hook: "The one piece of content that grew my account more than anything else had almost nothing fancy about it.",
    onScreenText: "MY MOST VIRAL POST WAS SIMPLE",
    transcript: "The one piece of content that grew my account more than anything else had almost nothing fancy about it. No trending audio. No motion graphics. Just me talking directly into the camera for forty-three seconds.",
  },
  {
    id: 9, accountId: 2, views: 890000, viewsLabel: "890K", postedDate: "Jun 9", hookType: "Question",
    hook: "If you have under ten thousand followers, you are guaranteed to be making this one mistake.",
    onScreenText: "IF YOU'RE UNDER 10K...",
    transcript: "If you have under ten thousand followers, you are guaranteed to be making this one mistake. You're creating content for your niche instead of creating content that draws people into your niche. The shift is subtle but it changes everything.",
  },
  {
    id: 10, accountId: 2, views: 560000, viewsLabel: "560K", postedDate: "Jun 7", hookType: "Contrast",
    hook: "The creator posting three times a week is consistently beating the one posting three times a day — and here's the data.",
    onScreenText: "3×/WEEK > 3×/DAY (proven)",
    transcript: "The creator posting three times a week is consistently beating the one posting three times a day. I tracked fifteen accounts over ninety days. The high-volume accounts averaged sixty-two thousand views per reel. The strategic ones averaged two hundred and ten thousand.",
  },

  // ── Gary Vaynerchuk ──
  {
    id: 11, accountId: 3, views: 4700000, viewsLabel: "4.7M", postedDate: "Jun 14", hookType: "Shock",
    hook: "Nobody wants to say this because it makes brands uncomfortable — but attention is the only thing that matters.",
    onScreenText: "UNCOMFORTABLE TRUTH ABOUT BRANDS",
    transcript: "Nobody wants to say this because it makes brands uncomfortable — but attention is the only thing that matters. Not reach. Not impressions. Not engagement rate. Attention. The moment they have it, everything else is detail.",
  },
  {
    id: 12, accountId: 3, views: 2300000, viewsLabel: "2.3M", postedDate: "Jun 12", hookType: "Curiosity",
    hook: "I've been saying this for fifteen years. Attention is the only asset that compounds in the creator economy.",
    onScreenText: "ATTENTION IS THE ONLY ASSET",
    transcript: "I've been saying this for fifteen years. Attention is the only asset that compounds in the creator economy. Real estate goes up and down. Stocks go up and down. But a loyal audience — that is the most defensible thing you can own.",
  },
  {
    id: 13, accountId: 3, views: 1800000, viewsLabel: "1.8M", postedDate: "Jun 10", hookType: "Contrast",
    hook: "Your LinkedIn profile right now is a resume. Let me show you how to turn it into a business in ninety days.",
    onScreenText: "YOUR LINKEDIN = BROKEN RESUME",
    transcript: "Your LinkedIn profile right now is a resume. Let me show you how to turn it into a business in ninety days. Most people optimize their profile for recruiters when they should be optimizing for buyers.",
  },
  {
    id: 14, accountId: 3, views: 890000, viewsLabel: "890K", postedDate: "Jun 8", hookType: "Shock",
    hook: "The creator economy is not a trend. It's the replacement for the middle class that got hollowed out over the last thirty years.",
    onScreenText: "CREATOR ECONOMY = NEW MIDDLE CLASS",
    transcript: "The creator economy is not a trend. It's the replacement for the middle class that got hollowed out over the last thirty years. And the people who understand this right now — in 2026 — are going to be generationally wealthy.",
  },
  {
    id: 15, accountId: 3, views: 640000, viewsLabel: "640K", postedDate: "Jun 6", hookType: "POV",
    hook: "Stop waiting for someone to give you permission to build the thing you already know you should build.",
    onScreenText: "STOP WAITING FOR PERMISSION",
    transcript: "Stop waiting for someone to give you permission to build the thing you already know you should build. The market doesn't care about your credentials. It only cares whether what you do is useful.",
  },

  // ── Justin Welsh ──
  {
    id: 16, accountId: 4, views: 820000, viewsLabel: "820K", postedDate: "Jun 15", hookType: "Story",
    hook: "I make four hundred thousand dollars a year working twenty-five hours a week — no team, no VC, no office.",
    onScreenText: "$400K/YR · 25 HRS/WK · SOLO",
    transcript: "I make four hundred thousand dollars a year working twenty-five hours a week — no team, no VC, no office. This is not hustle porn. This is a very specific model that I reverse-engineered after burning out in a VP role.",
  },
  {
    id: 17, accountId: 4, views: 640000, viewsLabel: "640K", postedDate: "Jun 13", hookType: "Contrast",
    hook: "Your email list is worth more than your social following and I'm going to prove it with actual numbers.",
    onScreenText: "EMAIL > FOLLOWERS (with math)",
    transcript: "Your email list is worth more than your social following and I'm going to prove it with actual numbers. My email list of forty thousand generates more revenue than my LinkedIn following of five hundred thousand. Here's why.",
  },
  {
    id: 18, accountId: 4, views: 480000, viewsLabel: "480K", postedDate: "Jun 11", hookType: "Curiosity",
    hook: "There's a business model nobody taught me in school that changed my entire financial life.",
    onScreenText: "THE MODEL NO ONE TEACHES",
    transcript: "There's a business model nobody taught me in school that changed my entire financial life. It's not dropshipping. It's not Amazon FBA. It's creating intellectual property once and licensing it forever.",
  },
  {
    id: 19, accountId: 4, views: 320000, viewsLabel: "320K", postedDate: "Jun 9", hookType: "Story",
    hook: "I turned down a two million dollar acquisition offer last year because of one principle and it was the right call.",
    onScreenText: "I SAID NO TO $2M (here's why)",
    transcript: "I turned down a two million dollar acquisition offer last year because of one principle. The principle: never sell the thing that gives you freedom for the thing that buys you comfort. Comfort has a ceiling. Freedom doesn't.",
  },
  {
    id: 20, accountId: 4, views: 210000, viewsLabel: "210K", postedDate: "Jun 7", hookType: "Listicle",
    hook: "Six figures as a one-person business is simpler than most people make it. Three things made it happen.",
    onScreenText: "3 THINGS → 6-FIGURE SOLOPRENEUR",
    transcript: "Six figures as a one-person business is simpler than most people make it. Three things made it happen for me. One: one niche, one platform, one offer. Two: daily content as a distribution flywheel. Three: an email list as the moat.",
  },

  // ── Dakota Robertson ──
  {
    id: 21, accountId: 5, views: 6400000, viewsLabel: "6.4M", postedDate: "Jun 14", hookType: "Shock",
    hook: "A thread I wrote six months ago still brings me twelve new clients every single month.",
    onScreenText: "1 THREAD = 12 CLIENTS/MO",
    transcript: "A thread I wrote six months ago still brings me twelve new clients every single month. I haven't promoted it. I haven't updated it. It just keeps compounding because it ranked on Google and gets reshared every week.",
  },
  {
    id: 22, accountId: 5, views: 3800000, viewsLabel: "3.8M", postedDate: "Jun 12", hookType: "Contrast",
    hook: "ChatGPT is making most copywriters obsolete. But here's what the people saying that are completely missing.",
    onScreenText: "AI DIDN'T KILL COPYWRITING",
    transcript: "ChatGPT is making most copywriters obsolete. But here's what the people saying that are completely missing. AI is replacing writers who copy templates. It cannot replace writers who have lived interesting lives and can prove it on the page.",
  },
  {
    id: 23, accountId: 5, views: 2100000, viewsLabel: "2.1M", postedDate: "Jun 10", hookType: "Curiosity",
    hook: "The most viral thing I ever wrote had nothing to do with what I do for a living — and that's exactly why it worked.",
    onScreenText: "MY MOST VIRAL TWEET WAS OFF-TOPIC",
    transcript: "The most viral thing I ever wrote had nothing to do with what I do for a living. It was about my dad teaching me to drive at fourteen in an empty parking lot. It got two million impressions. Personal stories outperform tactical advice every time.",
  },
  {
    id: 24, accountId: 5, views: 1200000, viewsLabel: "1.2M", postedDate: "Jun 8", hookType: "Contrast",
    hook: "Stop writing about what you already know. Write about what you are actively figuring out right now.",
    onScreenText: "WRITE THIS, NOT THAT",
    transcript: "Stop writing about what you already know. Write about what you are actively figuring out right now. In-progress learning creates genuine curiosity in readers because they want to know how the story ends — and so do you.",
  },
  {
    id: 25, accountId: 5, views: 780000, viewsLabel: "780K", postedDate: "Jun 6", hookType: "Listicle",
    hook: "Five writing formulas that took me from zero followers to a hundred thousand in under twelve months.",
    onScreenText: "5 WRITING FORMULAS THAT PRINT FOLLOWERS",
    transcript: "Five writing formulas that took me from zero followers to a hundred thousand in under twelve months. Formula one: the personal incident hook. Lead with the specific moment something changed for you — not the lesson, the moment.",
  },

  // ── Andrew Huberman ──
  {
    id: 26, accountId: 6, views: 9200000, viewsLabel: "9.2M", postedDate: "Jun 15", hookType: "Shock",
    hook: "Your phone is physically reshaping your brain right now — and most people have absolutely no idea it's happening.",
    onScreenText: "YOUR PHONE IS CHANGING YOUR BRAIN",
    transcript: "Your phone is physically reshaping your brain right now — and most people have absolutely no idea it's happening. Specifically, the dopamine system is being recalibrated by constant micro-reward cycles. The result is a measurable reduction in baseline motivation.",
  },
  {
    id: 27, accountId: 6, views: 6100000, viewsLabel: "6.1M", postedDate: "Jun 13", hookType: "Shock",
    hook: "We found that a twenty-minute walk done at this specific time doubled fat loss compared to the control group with no other changes.",
    onScreenText: "DOUBLE FAT LOSS: 1 TIMING CHANGE",
    transcript: "We found that a twenty-minute walk done at this specific time doubled fat loss compared to the control group with no other dietary or exercise changes. The time is within thirty to sixty minutes after eating your largest meal of the day.",
  },
  {
    id: 28, accountId: 6, views: 4300000, viewsLabel: "4.3M", postedDate: "Jun 11", hookType: "Curiosity",
    hook: "The most underrated protocol for dramatically improving focus is something most people are actively avoiding every single day.",
    onScreenText: "FOCUS PROTOCOL MOST PEOPLE AVOID",
    transcript: "The most underrated protocol for dramatically improving focus is something most people are actively avoiding every single day. It is deliberately boring yourself. When you remove all stimulation for fifteen minutes — no phone, no podcast, no input — your brain reorganizes its attentional resources.",
  },
  {
    id: 29, accountId: 6, views: 2700000, viewsLabel: "2.7M", postedDate: "Jun 9", hookType: "Question",
    hook: "Cold exposure done at this specific time triggers a dopamine increase that lasts four to six hours — but most people do it wrong.",
    onScreenText: "COLD SHOWER TIMING = EVERYTHING",
    transcript: "Cold exposure done at this specific time triggers a dopamine increase that lasts four to six hours — but most people do it wrong. The data shows you want to do this in the morning, never within four hours of sleep, and the water should be cold enough to make you want to get out.",
  },
  {
    id: 30, accountId: 6, views: 1400000, viewsLabel: "1.4M", postedDate: "Jun 7", hookType: "Listicle",
    hook: "Viewing bright light within thirty minutes of waking is the single highest-leverage thing you can do for your circadian biology.",
    onScreenText: "DO THIS WITHIN 30 MIN OF WAKING",
    transcript: "Viewing bright light within thirty minutes of waking is the single highest-leverage thing you can do for your circadian biology. Outdoor light, even on an overcast day, is ten to fifty times more powerful than indoor light at setting your internal clock.",
  },

  // ── Chris Williamson ──
  {
    id: 31, accountId: 7, views: 1400000, viewsLabel: "1.4M", postedDate: "Jun 14", hookType: "Curiosity",
    hook: "The reason most people never figure out what they actually want from life has nothing to do with clarity — it has to do with avoidance.",
    onScreenText: "WHY YOU DON'T KNOW WHAT YOU WANT",
    transcript: "The reason most people never figure out what they actually want from life has nothing to do with clarity — it has to do with avoidance. If you get specific about what you want, you become accountable to it. Most people prefer the comfort of vague ambition.",
  },
  {
    id: 32, accountId: 7, views: 980000, viewsLabel: "980K", postedDate: "Jun 12", hookType: "Shock",
    hook: "Comfort is the enemy of identity. The version of yourself you want to become requires sustained discomfort.",
    onScreenText: "COMFORT = IDENTITY DEATH",
    transcript: "Comfort is the enemy of identity. The version of yourself you want to become requires sustained discomfort — and most people will never accept that trade. They want the result without the process, which is why they stay exactly who they are.",
  },
  {
    id: 33, accountId: 7, views: 720000, viewsLabel: "720K", postedDate: "Jun 10", hookType: "Story",
    hook: "I asked fifty genuinely successful men what they wish they'd done differently in their twenties — the most common answer surprised me.",
    onScreenText: "50 SUCCESSFUL MEN SAID THIS",
    transcript: "I asked fifty genuinely successful men what they wish they'd done differently in their twenties. I expected them to say invest earlier or work harder. The most common answer was: I wish I'd taken my physical health as seriously as my professional ambition.",
  },
  {
    id: 34, accountId: 7, views: 450000, viewsLabel: "450K", postedDate: "Jun 8", hookType: "Question",
    hook: "Modern men are statistically losing the motivation to do hard things. Here's exactly why it's happening.",
    onScreenText: "WHY MEN ARE LOSING MOTIVATION",
    transcript: "Modern men are statistically losing the motivation to do hard things. Testosterone levels have dropped thirty percent since 1980. Dopamine baselines are lower due to overstimulation. And the social scripts that once gave men clear purpose have been removed without replacements.",
  },
  {
    id: 35, accountId: 7, views: 290000, viewsLabel: "290K", postedDate: "Jun 6", hookType: "Story",
    hook: "The conversation I had with a billionaire about regret will fundamentally change how you think about your next decade.",
    onScreenText: "BILLIONAIRE'S TAKE ON REGRET",
    transcript: "The conversation I had with a billionaire about regret will fundamentally change how you think about your next decade. He said: all regret is the same regret — it's the regret of not knowing yourself well enough to act on what you actually believed.",
  },

  // ── Ali Abdaal ──
  {
    id: 36, accountId: 8, views: 2800000, viewsLabel: "2.8M", postedDate: "Jun 15", hookType: "Story",
    hook: "I spent an entire week testing the most popular productivity systems so you don't have to — here's what actually worked.",
    onScreenText: "I TESTED EVERY PRODUCTIVITY SYSTEM",
    transcript: "I spent an entire week testing the most popular productivity systems so you don't have to. GTD, time blocking, Pomodoro, Eat the Frog, and three others. Most of them failed in the same way: they're designed for people who already have discipline.",
  },
  {
    id: 37, accountId: 8, views: 1600000, viewsLabel: "1.6M", postedDate: "Jun 13", hookType: "Story",
    hook: "The YouTube strategy that took me from zero to four million subscribers without burning out — I'm sharing the whole thing.",
    onScreenText: "0 → 4M SUBS: MY EXACT STRATEGY",
    transcript: "The YouTube strategy that took me from zero to four million subscribers without burning out. The short version: I only made videos I was genuinely curious about. If I wasn't excited to make it, the audience could always tell.",
  },
  {
    id: 38, accountId: 8, views: 980000, viewsLabel: "980K", postedDate: "Jun 11", hookType: "Contrast",
    hook: "You don't actually need more discipline. You need better systems. Here's what that looks like in practice.",
    onScreenText: "DISCIPLINE IS OVERRATED",
    transcript: "You don't actually need more discipline. You need better systems. Here's what that looks like in practice: I haven't 'disciplined' myself to read in years. I just always have a book on my desk and never open my phone until I've read for twenty minutes.",
  },
  {
    id: 39, accountId: 8, views: 640000, viewsLabel: "640K", postedDate: "Jun 9", hookType: "Story",
    hook: "I paid three experts ten thousand dollars each for their single best piece of advice on building a team. Here's what I got.",
    onScreenText: "I PAID $30K FOR THIS ADVICE",
    transcript: "I paid three different experts ten thousand dollars each for their single best piece of advice on building a team. The most surprising answer came from a former Navy SEAL: hire for coachability over competence. Skills transfer. Attitude doesn't.",
  },
  {
    id: 40, accountId: 8, views: 380000, viewsLabel: "380K", postedDate: "Jun 7", hookType: "Contrast",
    hook: "The note-taking app you use matters far less than most people think. Here's what actually determines whether you remember things.",
    onScreenText: "YOUR NOTE APP DOESN'T MATTER",
    transcript: "The note-taking app you use matters far less than most people think. I've used every app on the market. The only thing that ever improved my retention was writing things in my own words immediately after learning them — app irrelevant.",
  },
]

// ─── Config ───────────────────────────────────────────────────────────────────

const HOOK_TYPE_COLORS: Record<string, string> = {
  Listicle:  "bg-yellow-500/15 text-yellow-300 border-yellow-500/20",
  Shock:     "bg-orange-500/15 text-orange-300 border-orange-500/20",
  Contrast:  "bg-pink-500/15 text-pink-300 border-pink-500/20",
  Story:     "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  POV:       "bg-blue-500/15 text-blue-300 border-blue-500/20",
  Question:  "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
  Curiosity: "bg-violet-500/15 text-violet-300 border-violet-500/20",
}

const AVATAR_COLORS = [
  "bg-violet-500", "bg-pink-500", "bg-emerald-500", "bg-blue-500",
  "bg-orange-500", "bg-cyan-500", "bg-rose-500", "bg-amber-500",
]

function viewColor(v: number) {
  if (v >= 5_000_000) return "text-yellow-400"
  if (v >= 1_000_000) return "text-orange-400"
  if (v >= 500_000)   return "text-violet-400"
  return "text-gray-400"
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AccountChip({ account, active, scraping, onClick }: { account: Account; active: boolean; scraping?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all whitespace-nowrap",
        active
          ? "bg-violet-500/15 text-violet-300 border-violet-500/30"
          : "text-gray-500 border-[#1f1f2e] hover:text-gray-200 hover:border-[#2a2a3e]"
      )}
    >
      <div className={cn("w-4 h-4 rounded-md flex items-center justify-center text-white text-[9px] font-bold", account.color)}>
        {scraping ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : account.initials[0]}
      </div>
      {account.name.split(" ")[0]}
      {scraping && <span className="text-[10px] text-violet-400 animate-pulse">Syncing</span>}
    </button>
  )
}

function ReelItem({
  reel, account, rank, saved, expanded,
  onSave, onToggleExpand,
}: {
  reel: ReelCard
  account: Account
  rank: number
  saved: boolean
  expanded: boolean
  onSave: () => void
  onToggleExpand: () => void
}) {
  return (
    <div className={cn(
      "bg-[#111119] border rounded-2xl overflow-hidden transition-all",
      saved ? "border-violet-500/30" : "border-[#1f1f2e] hover:border-[#2a2a3a]"
    )}>
      {/* ── Card header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1a1a2a]">
        <div className="flex items-center gap-3">
          {/* Rank */}
          <div className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0",
            rank <= 3 ? "bg-violet-600 text-white" : "bg-[#1f1f2e] text-gray-400"
          )}>
            {rank}
          </div>
          {/* Creator */}
          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0", account.color)}>
            {account.initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-none">{account.name}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{account.handle} · {account.followersLabel} followers · {account.platform}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className={cn("text-lg font-black tabular-nums", viewColor(reel.views))}>{reel.viewsLabel}</p>
            <p className="text-[10px] text-gray-600">views · {reel.postedDate}</p>
          </div>
          <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full border", HOOK_TYPE_COLORS[reel.hookType] || "bg-gray-500/15 text-gray-300 border-gray-500/20")}>
            {reel.hookType}
          </span>
        </div>
      </div>

      {/* ── Content body ── */}
      <div className="px-5 py-4 space-y-3">
        {/* Spoken hook */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Mic className="w-3 h-3 text-violet-400" />
            <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">Spoken Hook</p>
            <span className="text-[10px] text-gray-600">· audio transcription</span>
          </div>
          <div className="bg-[#0a0a12] border border-violet-500/15 rounded-xl px-3.5 py-3">
            <p className="text-sm text-gray-200 leading-relaxed italic">&ldquo;{reel.hook}&rdquo;</p>
          </div>
        </div>

        {/* On-screen text */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Monitor className="w-3 h-3 text-cyan-400" />
            <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">On-Screen Text</p>
            <span className="text-[10px] text-gray-600">· OCR overlay</span>
          </div>
          <div className="bg-[#08080f] border border-cyan-500/10 rounded-xl px-3.5 py-2.5 font-mono">
            <p className="text-sm font-bold text-cyan-300 tracking-wide">{reel.onScreenText}</p>
          </div>
        </div>

        {/* Transcript (collapsible) */}
        <div>
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-1.5 mb-1.5 group"
          >
            <FileText className="w-3 h-3 text-gray-500" />
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest group-hover:text-gray-400 transition-colors">
              Transcript
            </p>
            <span className="text-[10px] text-gray-600">· first 8 seconds</span>
            {expanded
              ? <ChevronUp className="w-3 h-3 text-gray-600 ml-0.5" />
              : <ChevronDown className="w-3 h-3 text-gray-600 ml-0.5" />}
          </button>
          {expanded && (
            <div className="bg-[#0a0a12] border border-[#1a1a2a] rounded-xl px-3.5 py-3">
              <p className="text-xs text-gray-400 leading-relaxed">{reel.transcript}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-[#1a1a2a]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-600 bg-[#0a0a12] border border-[#1a1a2a] px-2 py-0.5 rounded-md">
            {account.niche}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={reel.url || profileUrl(account)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 border border-transparent hover:border-[#1f1f2e] px-2 py-1.5 rounded-lg transition-all"
          >
            <ExternalLink className="w-3 h-3" />
            Watch
          </a>
          <button
            onClick={onSave}
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all",
              saved
                ? "bg-violet-500/15 text-violet-300 border-violet-500/30"
                : "bg-[#1a1a2a] text-gray-300 border-[#1f1f2e] hover:bg-violet-500/10 hover:text-violet-300 hover:border-violet-500/25"
            )}
          >
            {saved ? <Check className="w-3 h-3" /> : <BookMarked className="w-3 h-3" />}
            {saved ? "Saved to Vault" : "Save to Hook Vault"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Add Account Modal ────────────────────────────────────────────────────────

function AddModal({ onClose, onAdd }: { onClose: () => void; onAdd: (data: { name: string; handle: string; platform: string; niche: string }) => void }) {
  const [name, setName]       = useState("")
  const [handle, setHandle]   = useState("")
  const [platform, setPlatform] = useState("Instagram")
  const [niche, setNiche]     = useState("")
  const [error, setError]     = useState("")

  function handleSubmit() {
    if (!name.trim()) {
      setError("Name is required.")
      return
    }
    if (!handle.trim()) {
      setError("Handle is required.")
      return
    }
    setError("")
    onAdd({ name: name.trim(), handle: handle.trim(), platform, niche: niche.trim() })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f0f1a] border border-[#1f1f2e] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f2e]">
          <h2 className="text-sm font-bold text-white">Track New Account</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-500">
            Add a handle and we'll immediately pull their top 5 reels via Apify — detecting hook type, extracting captions, and syncing view counts automatically.
          </p>
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
          )}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Name <span className="text-red-400">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Naval Ravikant"
              className="w-full px-3 py-2.5 bg-[#0a0a12] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50" />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Handle <span className="text-red-400">*</span></label>
            <input value={handle} onChange={e => setHandle(e.target.value)}
              placeholder="@creatorhandle"
              className="w-full px-3 py-2.5 bg-[#0a0a12] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50" />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Platform</label>
            <select value={platform} onChange={e => setPlatform(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#0a0a12] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 focus:outline-none focus:border-violet-500/50">
              {["Instagram", "TikTok", "YouTube", "Twitter", "LinkedIn"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Niche</label>
            <input value={niche} onChange={e => setNiche(e.target.value)}
              placeholder="e.g. Investing, SaaS, Fitness..."
              className="w-full px-3 py-2.5 bg-[#0a0a12] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50" />
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-[#1f1f2e] text-sm text-gray-400 hover:text-white transition-all">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors">
            Add & Schedule
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Add Reel Modal ───────────────────────────────────────────────────────────

const HOOK_TYPES_LIST = ["Listicle", "Shock", "Contrast", "Story", "POV", "Question", "Curiosity"]

function AddReelModal({ accountId, onClose, onAdd }: {
  accountId: number
  onClose: () => void
  onAdd: (reel: Omit<ReelCard, "id">) => void
}) {
  const [hook, setHook]             = useState("")
  const [onScreenText, setOnScreen] = useState("")
  const [transcript, setTranscript] = useState("")
  const [views, setViews]           = useState("")
  const [hookType, setHookType]     = useState("Shock")
  const [error, setError]           = useState("")

  const submit = () => {
    if (!hook.trim()) { setError("Spoken hook is required"); return }
    const viewsNum = parseInt(views.replace(/[^0-9]/g, "")) || 0
    const viewsLabel = viewsNum >= 1_000_000
      ? `${(viewsNum / 1_000_000).toFixed(1)}M`
      : viewsNum >= 1_000 ? `${Math.round(viewsNum / 1_000)}K` : viewsNum ? String(viewsNum) : "—"
    onAdd({
      accountId,
      views: viewsNum,
      viewsLabel,
      postedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      hookType,
      hook: hook.trim(),
      onScreenText: onScreenText.trim() || hook.trim().toUpperCase(),
      transcript: transcript.trim() || hook.trim(),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f0f1a] border border-[#1f1f2e] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f2e]">
          <h2 className="text-sm font-bold text-white">Add Reel Manually</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Spoken Hook <span className="text-red-400">*</span></label>
            <textarea rows={2} value={hook} onChange={e => { setHook(e.target.value); setError("") }}
              placeholder="First 1-2 sentences of the audio..."
              className="w-full px-3 py-2.5 bg-[#0a0a12] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Views</label>
              <input value={views} onChange={e => setViews(e.target.value)}
                placeholder="e.g. 1200000"
                className="w-full px-3 py-2.5 bg-[#0a0a12] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50" />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Hook Type</label>
              <select value={hookType} onChange={e => setHookType(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0a0a12] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 focus:outline-none focus:border-violet-500/50">
                {HOOK_TYPES_LIST.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">On-Screen Text</label>
            <input value={onScreenText} onChange={e => setOnScreen(e.target.value)}
              placeholder="Text overlaid on the video..."
              className="w-full px-3 py-2.5 bg-[#0a0a12] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50" />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 block">Full Transcript (optional)</label>
            <textarea rows={3} value={transcript} onChange={e => setTranscript(e.target.value)}
              placeholder="First 8 seconds of audio..."
              className="w-full px-3 py-2.5 bg-[#0a0a12] border border-[#1f1f2e] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 resize-none" />
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-[#1f1f2e] text-sm text-gray-400 hover:text-white transition-all">Cancel</button>
          <button onClick={submit} className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors">
            Add Reel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CompetitorTracker() {
  const [accountFilter, setAccountFilter] = useState<number | null>(null)
  const [savedIds, setSavedIds]           = useState<Set<number>>(new Set())
  const [expandedIds, setExpandedIds]     = useState<Set<number>>(new Set())
  const [showAdd, setShowAdd]             = useState(false)
  const [scraping, setScraping]           = useState(false)
  const [customAccounts, setCustomAccounts] = useState<Account[]>([])
  const [customReels, setCustomReels]       = useState<ReelCard[]>([])
  const [showAddReel, setShowAddReel]       = useState(false)
  const [scrapeJobs, setScrapeJobs] = useState<Record<number, { runId: string; platform: string }>>({})
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cd_tracked_accounts")
      if (raw) setCustomAccounts(JSON.parse(raw) as Account[])
    } catch {}
    try {
      const raw2 = localStorage.getItem("cd_custom_reels")
      if (raw2) setCustomReels(JSON.parse(raw2) as ReelCard[])
    } catch {}
  }, [])

  // Poll Apify run status for all pending scrape jobs
  useEffect(() => {
    if (Object.keys(scrapeJobs).length === 0) {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
      return
    }

    const tick = async () => {
      for (const [accountIdStr, job] of Object.entries(scrapeJobs)) {
        const accountId = Number(accountIdStr)
        try {
          const res = await fetch(
            `/api/scrape-status?runId=${job.runId}&accountId=${accountId}&platform=${encodeURIComponent(job.platform)}`
          )
          const data = await res.json()

          if (data.status === "done") {
            if (Array.isArray(data.reels) && data.reels.length > 0) {
              const newReels: ReelCard[] = data.reels.map((r: Omit<ReelCard, "id">, i: number) => ({
                ...r,
                id: Date.now() + i,
              }))
              setCustomReels(prev => {
                const updated = [...prev, ...newReels]
                try { localStorage.setItem("cd_custom_reels", JSON.stringify(updated)) } catch {}
                return updated
              })
            }
            setScrapeJobs(prev => { const n = { ...prev }; delete n[accountId]; return n })
          } else if (data.status === "failed") {
            setScrapeJobs(prev => { const n = { ...prev }; delete n[accountId]; return n })
          }
        } catch {}
      }
    }

    pollRef.current = setInterval(tick, 5000)
    return () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null } }
  }, [scrapeJobs])

  const allAccounts: Account[] = useMemo(
    () => [...ACCOUNTS, ...customAccounts],
    [customAccounts]
  )

  const allReels: ReelCard[] = useMemo(
    () => [...REELS, ...customReels],
    [customReels]
  )

  const sorted = useMemo(() => {
    const reels = accountFilter != null ? allReels.filter(r => r.accountId === accountFilter) : allReels
    return [...reels].sort((a, b) => b.views - a.views)
  }, [accountFilter, allReels])

  const toggleSave = (reel: ReelCard) => {
    const id = reel.id
    setSavedIds(p => {
      const n = new Set(p)
      if (n.has(id)) {
        n.delete(id)
      } else {
        n.add(id)
        // Persist to Hook Vault
        const account = allAccounts.find(a => a.id === reel.accountId)
        const hook: StoredHook = {
          id: `competitor-${id}`,
          template: reel.hook,
          original: reel.hook,
          hookType: reel.hookType,
          niche: account?.niche ?? "",
          creatorName: account?.name ?? "",
          views: reel.views,
          viewsLabel: reel.viewsLabel,
          savedAt: new Date().toISOString(),
          source: "competitor",
        }
        hooksStore.add(hook)
      }
      return n
    })
  }

  const toggleExpand = (id: number) =>
    setExpandedIds(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })

  const scrapeNow = async () => {
    setScraping(true)
    try {
      for (const acc of customAccounts) {
        if (scrapeJobs[acc.id]) continue // already running
        const res = await fetch("/api/scrape-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle: acc.handle, platform: acc.platform, accountId: acc.id }),
        })
        if (res.ok) {
          const { runId } = await res.json()
          if (runId) setScrapeJobs(prev => ({ ...prev, [acc.id]: { runId, platform: acc.platform } }))
        }
      }
    } catch {}
    setScraping(false)
  }

  const handleAddAccount = (data: { name: string; handle: string; platform: string; niche: string }) => {
    const words = data.name.trim().split(/\s+/)
    const initials = words.length >= 2
      ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
      : words[0].slice(0, 2).toUpperCase()
    const newAccount: Account = {
      id: Date.now(),
      name: data.name,
      handle: data.handle,
      followers: 0,
      followersLabel: "—",
      initials,
      color: AVATAR_COLORS[customAccounts.length % AVATAR_COLORS.length],
      platform: data.platform,
      niche: data.niche || "—",
    }
    // Synchronously add the account — this must complete before onClose() fires
    setCustomAccounts(prev => {
      const updated = [...prev, newAccount]
      try { localStorage.setItem("cd_tracked_accounts", JSON.stringify(updated)) } catch {}
      return updated
    })

    // Fire-and-forget scrape — doesn't block account addition
    ;(async () => {
      try {
        const res = await fetch("/api/scrape-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle: data.handle, platform: data.platform, accountId: newAccount.id }),
        })
        if (res.ok) {
          const { runId } = await res.json()
          if (runId) {
            setScrapeJobs(prev => ({ ...prev, [newAccount.id]: { runId, platform: data.platform } }))
            setAccountFilter(newAccount.id)
          }
        }
      } catch {}
    })()
  }

  const handleAddReel = (reel: Omit<ReelCard, "id">) => {
    const newReel: ReelCard = { ...reel, id: Date.now() }
    const updated = [...customReels, newReel]
    setCustomReels(updated)
    try { localStorage.setItem("cd_custom_reels", JSON.stringify(updated)) } catch {}
  }

  const accountForReel = (id: number) => allAccounts.find(a => a.id === id)!

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-violet-400" />
            <h1 className="text-xl font-bold text-white">Competitor Tracker</h1>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
              {allAccounts.length} accounts
            </span>
          </div>
          <p className="text-sm text-gray-500">Top 5 reels per account · audio transcribed · scraped weekly</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={scrapeNow} disabled={scraping}
            className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border border-[#1f1f2e] text-sm text-gray-400 hover:text-white hover:border-[#2a2a3e] transition-all", scraping && "opacity-60")}>
            <RefreshCw className={cn("w-3.5 h-3.5", scraping && "animate-spin")} />
            {scraping ? "Scraping..." : "Scrape now"}
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-violet-900/30">
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        </div>
      </div>

      {/* Scrape status bar */}
      <div className="flex items-center gap-4 px-4 py-3 bg-[#111119] border border-[#1f1f2e] rounded-2xl mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400">Fresh</span>
        </div>
        <div className="w-px h-4 bg-[#1f1f2e]" />
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          Last scraped <span className="text-gray-300 font-medium">Sun Jun 15 · 6:00 AM</span>
        </div>
        <div className="w-px h-4 bg-[#1f1f2e]" />
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <CalendarDays className="w-3 h-3" />
          Next scrape <span className="text-gray-300 font-medium">Sun Jun 22 · 6:00 AM</span>
          <span className="text-gray-600">(6 days away)</span>
        </div>
        <div className="w-px h-4 bg-[#1f1f2e]" />
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Zap className="w-3 h-3 text-yellow-400" />
          <span className="text-gray-300 font-medium">{allReels.length} reels</span> scraped this week
        </div>
      </div>

      {/* Account filter chips */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setAccountFilter(null)}
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
            accountFilter === null
              ? "bg-violet-500/15 text-violet-300 border-violet-500/30"
              : "text-gray-500 border-[#1f1f2e] hover:text-gray-200 hover:border-[#2a2a3e]"
          )}
        >
          All {allAccounts.length} accounts
        </button>
        {allAccounts.map(acc => (
          <AccountChip
            key={acc.id}
            account={acc}
            active={accountFilter === acc.id}
            scraping={!!scrapeJobs[acc.id]}
            onClick={() => setAccountFilter(accountFilter === acc.id ? null : acc.id)}
          />
        ))}
      </div>

      {/* Result count */}
      <p className="text-xs text-gray-600 mb-4">
        Showing <span className="text-gray-300 font-semibold">{sorted.length} reels</span>
        {accountFilter != null && <> from <span className="text-gray-300 font-semibold">{allAccounts.find(a => a.id === accountFilter)?.name}</span></>}
        {" "}· sorted by view count
      </p>

      {/* Reel list */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#111119] border border-[#1f1f2e] flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-gray-600" />
          </div>
          <p className="text-sm font-semibold text-gray-300 mb-1">
            {accountFilter != null && scrapeJobs[accountFilter]
              ? "Scraping reels from Apify…"
              : accountFilter != null ? "No reels yet for this account" : "No reels found"}
          </p>
          <p className="text-xs text-gray-600 mb-5 max-w-xs">
            {accountFilter != null && scrapeJobs[accountFilter]
              ? "Pulling top reels via Apify. This usually takes 30–60 seconds."
              : accountFilter != null
              ? "Reels are scraped automatically when you add an account. Add one manually to get started."
              : "Try clearing your filters."}
          </p>
          {accountFilter != null && (
            <button
              onClick={() => setShowAddReel(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Reel Manually
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((reel, i) => (
            <ReelItem
              key={reel.id}
              reel={reel}
              account={accountForReel(reel.accountId)}
              rank={i + 1}
              saved={savedIds.has(reel.id)}
              expanded={expandedIds.has(reel.id)}
              onSave={() => toggleSave(reel)}
              onToggleExpand={() => toggleExpand(reel.id)}
            />
          ))}
        </div>
      )}

      {showAdd && (
        <AddModal
          onClose={() => setShowAdd(false)}
          onAdd={handleAddAccount}
        />
      )}
      {showAddReel && accountFilter != null && (
        <AddReelModal
          accountId={accountFilter}
          onClose={() => setShowAddReel(false)}
          onAdd={handleAddReel}
        />
      )}
    </div>
  )
}
