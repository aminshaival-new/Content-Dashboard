"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookMarked,
  BarChart3,
  Users,
  CalendarDays,
  Calendar,
  TrendingUp,
  Sparkles,
  Settings,
  Zap,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/hook-vault", label: "Hook Vault", icon: BookMarked },
  { href: "/script", label: "Script", icon: FileText },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/competitor-tracker", label: "Competitor Tracker", icon: Users },
  { href: "/scheduler", label: "Scheduler", icon: Calendar },
  { href: "/content-calendar", label: "Content Calendar", icon: CalendarDays },
  { href: "/trending", label: "What's Trending", icon: TrendingUp },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-60 flex-shrink-0 h-screen bg-[#0d0d16] border-r border-[#1a1a2a] flex flex-col">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-[#1a1a2a]">
        <div className="flex items-center gap-2.5 mb-0.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-900/40">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-violet-300 tracking-tight">@shaiival.ai</span>
        </div>
        <p className="text-[11px] text-gray-600 ml-[42px]">Creator Dashboard</p>
      </div>

      {/* Status pill */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 w-fit">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-emerald-400 font-medium">Live syncing</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                active
                  ? "bg-violet-500/15 text-violet-300"
                  : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0",
                  active ? "text-violet-400" : "text-gray-600"
                )}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Quick action */}
      <div className="px-3 pb-2">
        <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors shadow-lg shadow-violet-900/30">
          <Zap className="w-4 h-4" />
          Generate Content
        </button>
      </div>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-[#1a1a2a] pt-3">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-200 hover:bg-white/5 w-full transition-all">
          <Settings className="w-4 h-4 text-gray-600" />
          Settings
        </button>
      </div>
    </div>
  )
}
