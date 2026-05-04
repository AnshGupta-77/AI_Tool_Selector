import { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, BarChart3 } from 'lucide-react'
import clsx from 'clsx'
import type { ComparisonTable as ComparisonTableType } from '../types'

interface ComparisonTableProps {
  data: ComparisonTableType
}

const ATTR_ICONS: Record<string, string> = {
  'Pricing': '💰',
  'Best For': '🎯',
  'Free Trial': '🆓',
  'Platform': '🖥️',
  'Ease of Use': '⚡',
  'Key Feature': '✨',
  'Key Strength': '💪',
  'Limitation': '⚠️',
  'Free Plan': '🎁',
  'Category': '📂',
}

export default function ComparisonTable({ data }: ComparisonTableProps) {
  const [expanded, setExpanded] = useState(true)

  if (!data || !data.tool_names?.length) return null

  return (
    <section className="w-full animate-fade-up">
      {/* Section header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between mb-4 group"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent-primary/15 border border-accent-primary/25
                          flex items-center justify-center">
            <BarChart3 size={13} className="text-accent-secondary" />
          </div>
          <div className="text-left">
            <h2 className="text-sm font-semibold text-white">Top Picks — Side by Side</h2>
            <p className="text-[10px] font-mono text-slate-500">Auto-comparing top {data.tool_names.length} results</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-500 group-hover:text-white transition-colors">
          <span className="text-xs font-mono">{expanded ? 'collapse' : 'expand'}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {expanded && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* Tool name headers */}
              <thead>
                <tr className="border-b border-bg-border">
                  <th className="text-left px-4 py-3 text-[11px] font-mono uppercase tracking-widest
                                  text-slate-500 w-32 bg-bg-elevated/50">
                    Attribute
                  </th>
                  {data.tool_names.map((name, i) => (
                    <th key={name} className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        {i === 0 && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full
                                           bg-accent-primary/20 text-accent-secondary border border-accent-primary/30
                                           uppercase tracking-wider">
                            Top Pick
                          </span>
                        )}
                        <a
                          href={data.tool_urls?.[i] ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-white hover:text-accent-secondary transition-colors
                                     flex items-center gap-1 group text-sm"
                        >
                          {name}
                          <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Rows */}
              <tbody>
                {data.rows.map((row, rowIdx) => (
                  <tr
                    key={row.attribute}
                    className={clsx(
                      'border-b border-bg-border/50 transition-colors hover:bg-bg-elevated/30',
                      rowIdx % 2 === 0 ? '' : 'bg-bg-elevated/10'
                    )}
                  >
                    {/* Attribute label */}
                    <td className="px-4 py-3 bg-bg-elevated/30">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                        <span className="text-sm">{ATTR_ICONS[row.attribute] ?? '•'}</span>
                        {row.attribute}
                      </div>
                    </td>

                    {/* Values */}
                    {row.values.map((val, colIdx) => (
                      <td
                        key={colIdx}
                        className={clsx(
                          'px-4 py-3 text-center text-xs',
                          colIdx === 0 ? 'text-white font-medium' : 'text-slate-400'
                        )}
                      >
                        <CellValue attribute={row.attribute} value={val} isFirst={colIdx === 0} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}

function CellValue({ attribute, value, isFirst }: { attribute: string; value: string; isFirst: boolean }) {
  // Pricing cell
  if (attribute === 'Pricing' || attribute === 'Free Plan') {
    const lv = value.toLowerCase()
    if (lv.includes('free') && !lv.includes('paid') && !lv.includes('$')) {
      return <span className="pricing-badge bg-green-500/10 text-green-400 border border-green-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5" />{value}
      </span>
    }
    if (lv.includes('freemium') || lv.includes('free tier')) {
      return <span className="pricing-badge bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5" />{value}
      </span>
    }
    if (lv.includes('paid') || lv.includes('$') || lv.includes('/mo')) {
      return <span className="pricing-badge bg-red-500/10 text-red-400 border border-red-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5" />{value}
      </span>
    }
  }

  // Boolean cells
  const lv = value.toLowerCase()
  if (['yes', 'true', '✓'].includes(lv)) {
    return <span className="text-green-400 font-semibold">✓ Yes</span>
  }
  if (['no', 'false', '✗'].includes(lv)) {
    return <span className="text-red-400">✗ No</span>
  }

  // Default
  return <span className={isFirst ? 'text-white' : 'text-slate-400'}>{value}</span>
}
