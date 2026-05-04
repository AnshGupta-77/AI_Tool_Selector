import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Grid3X3, List, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import { getAllTools, getCategories } from '../lib/api'
import type { ToolResult, Category } from '../types'
import clsx from 'clsx'

const PRICING_CONFIG = {
  free:     { label: 'Free',     bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', dot: '#22c55e' },
  freemium: { label: 'Freemium', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: '#f59e0b' },
  paid:     { label: 'Paid',     bg: 'bg-red-500/10',   text: 'text-red-400',   border: 'border-red-500/20',   dot: '#ef4444' },
}

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tools, setTools] = useState<ToolResult[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const page = parseInt(searchParams.get('page') ?? '1')
  const category = searchParams.get('category') ?? ''
  const pricing = searchParams.get('pricing') ?? ''
  const q = searchParams.get('q') ?? ''

  const fetchTools = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAllTools({ category: category || undefined, pricing: pricing || undefined, q: q || undefined, page, limit: 24 })
      setTools(res.tools as ToolResult[])
      setTotal(res.total)
      setPages(res.pages)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [category, pricing, q, page])

  useEffect(() => { fetchTools() }, [fetchTools])
  useEffect(() => { getCategories().then(r => setCategories(r.categories)).catch(() => {}) }, [])

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value); else p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(p))
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Grid3X3 size={18} className="text-accent-primary" />
            Browse AI Tools
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-mono">
            {total} tools · curated database
          </p>
        </div>
        <div className="flex items-center gap-2 p-1 rounded-lg bg-bg-surface border border-bg-border">
          {(['grid', 'list'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={clsx(
                'p-2 rounded-md transition-all',
                viewMode === mode ? 'bg-accent-primary/20 text-accent-secondary' : 'text-slate-500 hover:text-white'
              )}
            >
              {mode === 'grid' ? <Grid3X3 size={14} /> : <List size={14} />}
            </button>
          ))}
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={q}
            onChange={e => setParam('q', e.target.value)}
            placeholder="Search tools..."
            className="input-base pl-9 py-2 text-xs h-9"
          />
        </div>

        {/* Category select */}
        <select
          value={category}
          onChange={e => setParam('category', e.target.value)}
          className="input-base h-9 py-0 text-xs max-w-[160px] cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.label} ({c.count})</option>
          ))}
        </select>

        {/* Pricing select */}
        <select
          value={pricing}
          onChange={e => setParam('pricing', e.target.value)}
          className="input-base h-9 py-0 text-xs max-w-[130px] cursor-pointer"
        >
          <option value="">All Pricing</option>
          <option value="free">Free</option>
          <option value="freemium">Freemium</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setParam('category', '')}
          className={clsx(
            'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
            !category
              ? 'bg-accent-primary/20 text-accent-secondary border-accent-primary/30'
              : 'text-slate-500 border-bg-border hover:text-white hover:border-slate-500'
          )}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setParam('category', cat.id)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
              category === cat.id
                ? 'bg-accent-primary/20 text-accent-secondary border-accent-primary/30'
                : 'text-slate-500 border-bg-border hover:text-white hover:border-slate-500'
            )}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Tools grid/list */}
      {loading ? (
        <div className={clsx('gap-4', viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col')}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="glass-card p-4 space-y-2 h-28">
              <div className="shimmer-line h-3 w-2/3 rounded" />
              <div className="shimmer-line h-2 w-1/3 rounded" />
              <div className="shimmer-line h-2 w-full rounded mt-2" />
              <div className="shimmer-line h-2 w-4/5 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className={clsx(
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'flex flex-col gap-2'
        )}>
          {tools.map((tool: any) => {
            const pricingConf = PRICING_CONFIG[tool.pricing as keyof typeof PRICING_CONFIG] ?? PRICING_CONFIG.freemium
            return (
              <article
                key={tool.id}
                className={clsx(
                  'glass-card-hover animate-fade-up',
                  viewMode === 'grid' ? 'p-4 flex flex-col gap-2.5' : 'p-3 flex items-center gap-4'
                )}
              >
                {/* Name + pricing */}
                <div className="flex items-start justify-between gap-2 flex-1 min-w-0">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white text-sm truncate">{tool.name}</h3>
                    <span className="text-[10px] font-mono text-slate-500">{tool.category}</span>
                  </div>
                  <span className={clsx('pricing-badge border shrink-0 text-[10px]', pricingConf.bg, pricingConf.text, pricingConf.border)}>
                    <span className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: pricingConf.dot }} />
                    {pricingConf.label}
                  </span>
                </div>

                {viewMode === 'grid' && (
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{tool.description}</p>
                )}

                {/* Tags */}
                {viewMode === 'grid' && tool.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {tool.tags.slice(0, 4).map((tag: string) => (
                      <span key={tag} className="tag text-[9px] px-1.5 py-0.5">{tag}</span>
                    ))}
                  </div>
                )}

                {/* Link */}
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={clsx(
                    'flex items-center gap-1 text-xs text-accent-secondary hover:text-white transition-colors group',
                    viewMode === 'list' ? 'ml-auto shrink-0' : 'mt-1'
                  )}
                >
                  Visit
                  <ExternalLink size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </article>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="btn-ghost py-2 px-3 disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: Math.min(pages, 7) }).map((_, i) => {
            const p = i + 1
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={clsx(
                  'w-9 h-9 rounded-lg text-sm font-medium transition-all border',
                  page === p
                    ? 'bg-accent-primary/20 text-accent-secondary border-accent-primary/30'
                    : 'text-slate-500 border-bg-border hover:text-white hover:border-slate-500'
                )}
              >
                {p}
              </button>
            )
          })}
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= pages}
            className="btn-ghost py-2 px-3 disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
