import { ExternalLink, Sparkles } from 'lucide-react'
import type { ToolResult } from '../types'

interface ResultCardProps {
  tool: ToolResult
  rank: number
}

const PRICING_CONFIG = {
  free:     { label: 'Free',     bg: 'rgba(34,197,94,0.1)',  text: '#4ade80',  border: 'rgba(34,197,94,0.25)',  dot: '#22c55e' },
  freemium: { label: 'Freemium', bg: 'rgba(245,158,11,0.1)', text: '#fbbf24',  border: 'rgba(245,158,11,0.25)', dot: '#f59e0b' },
  paid:     { label: 'Paid',     bg: 'rgba(239,68,68,0.1)',  text: '#f87171',  border: 'rgba(239,68,68,0.25)',  dot: '#ef4444' },
}

const CATEGORY_COLORS: Record<string, string> = {
  writing: '#6366f1', coding: '#22c55e', image: '#f59e0b',
  video: '#ef4444', audio: '#8b5cf6', design: '#06b6d4',
  productivity: '#f97316', research: '#10b981', business: '#3b82f6',
  marketing: '#ec4899', presentation: '#a78bfa', '3d': '#14b8a6',
}

export default function ResultCard({ tool, rank }: ResultCardProps) {
  const pricing = PRICING_CONFIG[tool.pricing as keyof typeof PRICING_CONFIG] ?? PRICING_CONFIG.freemium
  const catColor = CATEGORY_COLORS[tool.category] ?? '#6366f1'
  const isTop = rank <= 3

  return (
    <article
      style={{
        background: '#111118',
        border: '1px solid #1e1e2e',
        borderRadius: 14,
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
        cursor: 'default',
        height: '100%',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.borderColor = 'rgba(99,102,241,0.35)'
        el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)'
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.borderColor = '#1e1e2e'
        el.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'
        el.style.transform = 'translateY(0)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 0 }}>
          {/* Rank */}
          <div style={{
            flexShrink: 0, width: 26, height: 26, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.6875rem', fontFamily: 'monospace', fontWeight: 700,
            background: isTop ? 'rgba(99,102,241,0.18)' : '#16161f',
            border: `1px solid ${isTop ? 'rgba(99,102,241,0.35)' : '#1e1e2e'}`,
            color: isTop ? '#a78bfa' : '#475569',
          }}>
            {rank}
          </div>

          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontWeight: 600, color: '#fff', fontSize: '0.9375rem', lineHeight: 1.3, margin: 0 }}>
              {tool.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span style={{
                fontSize: '0.6875rem', fontFamily: 'monospace',
                padding: '2px 7px', borderRadius: 5,
                color: catColor, background: `${catColor}18`,
              }}>
                {tool.category}
              </span>
              {tool.source === 'web' && (
                <span style={{
                  fontSize: '0.6rem', fontFamily: 'monospace',
                  padding: '2px 6px', borderRadius: 5,
                  color: '#60a5fa', background: 'rgba(96,165,250,0.1)',
                  border: '1px solid rgba(96,165,250,0.2)',
                }}>
                  web
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Pricing badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 9px', borderRadius: 20,
          fontSize: '0.6875rem', fontWeight: 700,
          fontFamily: 'JetBrains Mono, monospace',
          background: pricing.bg, color: pricing.text,
          border: `1px solid ${pricing.border}`,
          flexShrink: 0, whiteSpace: 'nowrap',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: pricing.dot, flexShrink: 0 }} />
          {pricing.label}
        </div>
      </div>

      {/* Why it fits */}
      <div style={{
        background: 'rgba(99,102,241,0.07)',
        border: '1px solid rgba(99,102,241,0.15)',
        borderRadius: 10, padding: '10px 12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Sparkles size={11} style={{ color: '#a78bfa' }} />
          <span style={{ fontSize: '0.625rem', fontFamily: 'monospace', color: '#7c6fb0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Why it fits
          </span>
        </div>
        <p style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.55, margin: 0 }}>
          {tool.why_it_fits}
        </p>
      </div>

      {/* Tags */}
      {tool.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {tool.tags.slice(0, 5).map(tag => (
            <span
              key={tag}
              style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '3px 7px', borderRadius: 6,
                fontSize: '0.6375rem', fontFamily: 'monospace', fontWeight: 500,
                background: '#16161f', border: '1px solid #1e1e2e', color: '#475569',
              }}
            >
              {tag}
            </span>
          ))}
          {tool.tags.length > 5 && (
            <span style={{
              padding: '3px 7px', borderRadius: 6, fontSize: '0.6375rem',
              fontFamily: 'monospace', background: '#16161f', border: '1px solid #1e1e2e', color: '#334155',
            }}>
              +{tool.tags.length - 5}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 10, borderTop: '1px solid #1e1e2e', marginTop: 'auto',
      }}>
        {/* Match score bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            width: 64, height: 4, borderRadius: 2,
            background: '#16161f', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 2,
              width: `${Math.round(tool.score * 100)}%`,
              background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
              transition: 'width 0.6s ease',
            }} />
          </div>
          <span style={{ fontSize: '0.6375rem', fontFamily: 'monospace', color: '#334155' }}>
            {Math.round(tool.score * 100)}% match
          </span>
        </div>

        {/* Visit link */}
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: '0.8rem', fontWeight: 600,
            color: '#a78bfa', textDecoration: 'none',
            padding: '5px 12px', borderRadius: 8,
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.background = 'rgba(99,102,241,0.2)'
            el.style.color = '#fff'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.background = 'rgba(99,102,241,0.1)'
            el.style.color = '#a78bfa'
          }}
          onClick={e => e.stopPropagation()}
        >
          Visit Tool
          <ExternalLink size={11} />
        </a>
      </div>
    </article>
  )
}
