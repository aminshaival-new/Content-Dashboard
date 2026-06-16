# Creator Content Dashboard — @shaiival.ai

## Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS v3 — dark-first design, no light mode toggle
- **Charts**: Recharts (AreaChart, BarChart) — client components only
- **Icons**: Lucide React
- **Fonts**: Inter via `next/font/google`
- **UI components**: Custom Tailwind components (no shadcn CLI; avoids the init friction in remote envs)

## Design Decisions

### Dark-first, no toggle
All color values are hardcoded dark-theme values (`#09090f` bg, `#111119` cards, `#1f1f2e` borders). The `html` tag gets `class="dark"` for Tailwind dark-variant compatibility but no toggle exists — this is a focused creator tool, not a marketing site.

### Light purple accent
- Primary: `#8b5cf6` (violet-500)
- Light variant: `#a78bfa` (violet-400) for text on dark backgrounds
- Dim glow: `violet-900/30` used for button shadows

### Color tokens (custom Tailwind)
```
d-bg      #09090f   — page background
d-surface #0f0f1a   — slightly lighter (sidebar)
d-card    #111119   — card background
d-border  #1f1f2e   — borders / dividers
d-muted   #2a2a3e   — hover states / muted UI
d-purple  #8b5cf6   — primary accent
d-purple-light #a78bfa — text accent
```

### Component approach
No Radix UI dependencies — all interactive elements (modals, tabs, filters) are hand-built with useState. This keeps the bundle light and avoids the complexity of initializing the shadcn CLI in a remote containerized environment.

### "use client" boundaries
- `Sidebar` — needs `usePathname()`
- All 6 pages — each has interactive state (search, filters, modals, charts)
- `layout.tsx` stays a server component

### Recharts + SSR
Recharts uses browser APIs so all chart-containing pages are client components. Charts use `ResponsiveContainer` for fluid sizing.

## Pages

| Route | Description |
|---|---|
| `/hook-vault` | Saved viral hooks with template highlighting (`[variable]` → violet) |
| `/analytics` | Views/saves/follows area chart + heaters of the week |
| `/competitor-tracker` | Tracked creators with scraped reel stats |
| `/scheduler` | Multi-platform post queue with AI caption generation |
| `/content-calendar` | Month grid with content type dots + AI fill |
| `/trending` | 12-source news feed with hook potential score |

## Running locally

```bash
npm install
npm run dev   # http://localhost:3000
```

Root `/` redirects to `/hook-vault`.

## Key files

```
src/
  app/layout.tsx          — root layout with Inter font + Sidebar
  components/sidebar.tsx  — nav sidebar, "use client"
  lib/utils.ts            — cn() + formatNum()
  app/*/page.tsx          — one file per page, all "use client"
```
