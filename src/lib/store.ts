// Client-side localStorage store — shared state across all pages

const KEY = {
  hooks:    "cd_hooks",
  posts:    "cd_posts",
  accounts: "cd_accounts",
  trending: "cd_trending",
} as const

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch { return fallback }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

// ─── Hook Vault ───────────────────────────────────────────────────────────────

export type StoredHook = {
  id: string
  template: string
  original: string
  hookType: string
  niche: string
  creatorName: string
  views: number
  viewsLabel: string
  savedAt: string
  source: "seed" | "manual" | "competitor" | "trending"
}

export const hooksStore = {
  list: (): StoredHook[] => read<StoredHook[]>(KEY.hooks, []),
  set:  (hooks: StoredHook[]) => write(KEY.hooks, hooks),
  add:  (h: StoredHook) => write(KEY.hooks, [h, ...hooksStore.list()]),
  remove: (id: string) => write(KEY.hooks, hooksStore.list().filter(h => h.id !== id)),
  has: (id: string) => hooksStore.list().some(h => h.id === id),
}

// ─── Scheduler / Calendar posts ───────────────────────────────────────────────

export type StoredPost = {
  id: string
  hookText: string
  angle: string
  cta: string
  platforms: string[]
  captions: Record<string, string>
  scheduledAt: string   // ISO
  status: "scheduled" | "draft" | "published" | "failed"
  hookType: string
  createdAt: string
}

export const postsStore = {
  list: (): StoredPost[] => read<StoredPost[]>(KEY.posts, []),
  add:  (p: StoredPost) => write(KEY.posts, [p, ...postsStore.list()]),
  update: (id: string, patch: Partial<StoredPost>) =>
    write(KEY.posts, postsStore.list().map(p => p.id === id ? { ...p, ...patch } : p)),
  remove: (id: string) => write(KEY.posts, postsStore.list().filter(p => p.id !== id)),
}

// ─── Competitor tracked accounts ──────────────────────────────────────────────

export type StoredAccount = {
  id: string
  name: string
  handle: string
  platform: string
  niche: string
  followersLabel: string
  initials: string
  color: string
  addedAt: string
}

export const accountsStore = {
  list:   (): StoredAccount[] => read<StoredAccount[]>(KEY.accounts, []),
  add:    (a: StoredAccount) => write(KEY.accounts, [...accountsStore.list(), a]),
  remove: (id: string) => write(KEY.accounts, accountsStore.list().filter(a => a.id !== id)),
}

// ─── Trending cache ───────────────────────────────────────────────────────────

export type CachedTrend = {
  id: string
  title: string
  summary: string
  source: string
  sourceType: "blog" | "x" | "rss" | "newsletter"
  url: string
  publishedAt: string
  tag: "hook-potential" | "explainer" | "skip"
  hookScore: number
  hookAngle?: string
  category: string
}

export const trendingStore = {
  get: (): { items: CachedTrend[]; cachedAt: string } | null =>
    read(KEY.trending, null),
  set: (data: { items: CachedTrend[]; cachedAt: string }) =>
    write(KEY.trending, data),
  isStale: (): boolean => {
    const c = trendingStore.get()
    if (!c) return true
    return Date.now() - new Date(c.cachedAt).getTime() > 30 * 60 * 1000
  },
}
