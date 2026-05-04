import { useEffect, useState } from 'react'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { getCategories } from '../lib/api'
import type { Category, SearchFilters } from '../types'

interface FilterSidebarProps {
  filters: SearchFilters
  onChange: (filters: SearchFilters) => void
  onApply: () => void
  isOpen: boolean
  onClose: () => void
}

const PRICING_OPTIONS = [
  { value: 'free', label: 'Free', color: '#22c55e', desc: 'Always free' },
  { value: 'freemium', label: 'Freemium', color: '#f59e0b', desc: 'Free tier + paid upgrades' },
  { value: 'paid', label: 'Paid', color: '#ef4444', desc: 'Subscription or one-time' },
]

export default function FilterSidebar({ filters, onChange, onApply, isOpen, onClose }: FilterSidebarProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [catOpen, setCatOpen] = useState(true)

  useEffect(() => {
    getCategories().then(res => setCategories(res.categories)).catch(() => {})
  }, [])

  const togglePricing = (value: string) => {
    const current = filters.pricing ?? []
    const updated = current.includes(value)
      ? current.filter(p => p !== value)
      : [...current, value]
    onChange({ ...filters, pricing: updated.length ? updated : undefined })
  }

  const setCategory = (cat: string) => {
    onChange({ ...filters, category: filters.category === cat ? undefined : cat })
  }

  const hasFilters = !!(filters.pricing?.length || filters.category)

  const clearAll = () => {
    onChange({})
  }

  const activeCount = (filters.pricing?.length ?? 0) + (filters.category ? 1 : 0)

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside className={clsx(
        'fixed md:sticky top-0 right-0 md:right-auto z-50 md:z-auto',
        'w-72 h-screen md:h-auto md:max-h-[calc(100vh-5rem)]',
        'bg-bg-surface md:bg-transparent border-l md:border-l-0 border-bg-border',
        'flex flex-col overflow-y-auto',
        'transition-transform duration-300 ease-out',
        'md:translate-x-0',
        isOpen ? 'translate-x-0' : 'translate-x-full',
        'md:block',
        'md:w-56 md:shrink-0'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-bg-border md:border-0 md:pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <SlidersHorizontal size={14} className="text-accent-primary" />
            Filters
            {activeCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-accent-primary text-[10px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasFilters && (
              <button onClick={clearAll} className="text-xs text-slate-500 hover:text-white transition-colors">
                Clear all
              </button>
            )}
            <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-5 flex-1">
          {/* Pricing */}
          <div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-slate-500 mb-2.5">Pricing</p>
            <div className="space-y-1.5">
              {PRICING_OPTIONS.map(opt => {
                const active = filters.pricing?.includes(opt.value)
                return (
                  <button
                    key={opt.value}
                    onClick={() => togglePricing(opt.value)}
                    className={clsx(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                      active
                        ? 'bg-bg-elevated border border-accent-primary/30 text-white'
                        : 'text-slate-400 hover:bg-bg-elevated hover:text-white border border-transparent'
                    )}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: opt.color, boxShadow: active ? `0 0 6px ${opt.color}` : 'none' }}
                    />
                    <span className="font-medium">{opt.label}</span>
                    <span className="ml-auto text-[10px] font-mono text-slate-600">{opt.desc}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Category */}
          <div>
            <button
              onClick={() => setCatOpen(o => !o)}
              className="w-full flex items-center justify-between mb-2.5"
            >
              <p className="text-[11px] font-mono uppercase tracking-widest text-slate-500">Category</p>
              <ChevronDown
                size={12}
                className={clsx('text-slate-600 transition-transform', catOpen ? 'rotate-180' : '')}
              />
            </button>
            {catOpen && (
              <div className="space-y-1">
                {categories.map(cat => {
                  const active = filters.category === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={clsx(
                        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                        active
                          ? 'bg-bg-elevated border border-accent-primary/30 text-white'
                          : 'text-slate-400 hover:bg-bg-elevated hover:text-white border border-transparent'
                      )}
                    >
                      <span className="text-base leading-none">{cat.icon}</span>
                      <span className="flex-1 text-left">{cat.label}</span>
                      <span className="text-[10px] font-mono text-slate-600">{cat.count}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Apply button (mobile) */}
        <div className="p-4 border-t border-bg-border md:hidden">
          <button onClick={() => { onApply(); onClose() }} className="btn-primary w-full justify-center">
            Apply Filters
          </button>
        </div>
      </aside>
    </>
  )
}
