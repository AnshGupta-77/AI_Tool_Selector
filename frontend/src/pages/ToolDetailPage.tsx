import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ExternalLink, ArrowLeft, Tag } from 'lucide-react'
import { getToolDetail } from '../lib/api'
import type { ToolResult } from '../types'

const PRICING_CONFIG = {
  free:     { label: 'Free',     bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', dot: '#22c55e' },
  freemium: { label: 'Freemium', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: '#f59e0b' },
  paid:     { label: 'Paid',     bg: 'bg-red-500/10',   text: 'text-red-400',   border: 'border-red-500/20',   dot: '#ef4444' },
}

export default function ToolDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [tool, setTool] = useState<ToolResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getToolDetail(id)
      .then(t => setTool(t as any))
      .catch(() => setError('Tool not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-4">
        <div className="shimmer-line h-8 w-48 rounded-xl" />
        <div className="shimmer-line h-4 w-full rounded" />
        <div className="shimmer-line h-4 w-3/4 rounded" />
      </div>
    )
  }

  if (error || !tool) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400">{error || 'Tool not found.'}</p>
        <Link to="/browse" className="btn-ghost mt-4 inline-flex">← Back to Browse</Link>
      </div>
    )
  }

  const pricing = PRICING_CONFIG[(tool as any).pricing as keyof typeof PRICING_CONFIG] ?? PRICING_CONFIG.freemium

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-up">
      <Link to="/browse" className="btn-ghost text-xs mb-8 inline-flex">
        <ArrowLeft size={12} />
        Back to Browse
      </Link>

      <div className="glass-card p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white">{(tool as any).name}</h1>
            <span className="text-xs font-mono text-slate-500 mt-1 block capitalize">{(tool as any).category}</span>
          </div>
          <span className={`pricing-badge border ${pricing.bg} ${pricing.text} ${pricing.border}`}>
            <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: pricing.dot }} />
            {pricing.label}
          </span>
        </div>

        {/* Description */}
        <p className="text-slate-300 leading-relaxed">{(tool as any).description}</p>

        {/* Tags */}
        {(tool as any).tags?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag size={13} className="text-slate-500" />
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(tool as any).tags.map((tag: string) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <a
          href={(tool as any).url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          Visit {(tool as any).name}
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  )
}
