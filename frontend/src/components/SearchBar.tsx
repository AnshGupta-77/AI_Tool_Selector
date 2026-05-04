import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Search, Sparkles, ArrowRight, Loader2, X } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  loading?: boolean
  initialValue?: string
  placeholder?: string
  size?: 'hero' | 'compact'
}

const EXAMPLES = [
  'Turn my podcast into short TikTok clips',
  'Write SEO-optimized blog posts automatically',
  'Help me debug Python code faster',
  'Generate product photos for my ecommerce store',
  'Compose background music for my YouTube videos',
  'Summarize research papers in seconds',
  'Create a logo and brand identity for my startup',
  'Automate repetitive browser tasks',
]

export default function SearchBar({
  onSearch,
  loading = false,
  initialValue = '',
  placeholder,
  size = 'hero',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue)
  const [exIdx, setExIdx] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isHero = size === 'hero'

  // Sync with initialValue changes (e.g. navigating to /results?q=...)
  useEffect(() => {
    setQuery(initialValue)
  }, [initialValue])

  // Cycle placeholder examples on hero
  useEffect(() => {
    if (!isHero) return
    const id = setInterval(() => setExIdx(i => (i + 1) % EXAMPLES.length), 3500)
    return () => clearInterval(id)
  }, [isHero])

  const submit = () => {
    const q = query.trim()
    if (q && !loading) onSearch(q)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: isHero ? 768 : '100%', margin: isHero ? '0 auto' : undefined }}>
      {/* Input box */}
      <div
        style={{
          position: 'relative',
          borderRadius: 16,
          border: '1px solid #1e1e2e',
          background: '#111118',
          boxShadow: isHero ? '0 8px 40px rgba(0,0,0,0.5)' : 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onFocus={() => {}}
        className="search-box-wrap"
      >
        {/* Search icon */}
        <div style={{
          position: 'absolute', left: 16, top: isHero ? 18 : 12,
          color: loading ? '#6366f1' : '#475569', pointerEvents: 'none',
          display: 'flex', alignItems: 'center',
        }}>
          {loading
            ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            : <Search size={16} />
          }
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          rows={isHero ? 2 : 1}
          placeholder={placeholder ?? EXAMPLES[exIdx]}
          disabled={loading}
          style={{
            width: '100%',
            background: 'transparent',
            resize: 'none',
            outline: 'none',
            border: 'none',
            color: '#fff',
            fontSize: isHero ? '1rem' : '0.875rem',
            lineHeight: isHero ? '1.6' : '1.5',
            paddingLeft: 44,
            paddingRight: 140,
            paddingTop: isHero ? 16 : 11,
            paddingBottom: isHero ? 16 : 11,
            fontFamily: 'Inter, system-ui, sans-serif',
            opacity: loading ? 0.7 : 1,
          }}
        />

        {/* Right controls */}
        <div style={{
          position: 'absolute', right: 12, top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {query && !loading && (
            <button
              onClick={() => { setQuery(''); textareaRef.current?.focus() }}
              style={{
                color: '#475569', background: 'none', border: 'none',
                cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
            >
              <X size={14} />
            </button>
          )}

          <button
            onClick={submit}
            disabled={!query.trim() || loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 10,
              fontSize: '0.8125rem', fontWeight: 600,
              border: 'none', cursor: query.trim() && !loading ? 'pointer' : 'not-allowed',
              background: query.trim() && !loading ? '#6366f1' : '#1e1e2e',
              color: query.trim() && !loading ? '#fff' : '#475569',
              boxShadow: query.trim() && !loading ? '0 0 20px rgba(99,102,241,0.35)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Searching</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span className="hidden sm:inline">Find Tools</span>
                <ArrowRight size={13} className="sm:hidden" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hero extras */}
      {isHero && (
        <>
          <p style={{
            textAlign: 'center', fontSize: '0.6875rem', color: '#334155',
            marginTop: 10, fontFamily: 'JetBrains Mono, monospace',
          }}>
            Press <kbd style={{ padding: '2px 5px', borderRadius: 4, background: '#16161f', border: '1px solid #1e1e2e', color: '#475569' }}>Enter</kbd> to search
            &nbsp;·&nbsp;
            <kbd style={{ padding: '2px 5px', borderRadius: 4, background: '#16161f', border: '1px solid #1e1e2e', color: '#475569' }}>Shift+Enter</kbd> for new line
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            {EXAMPLES.slice(0, 4).map(ex => (
              <button
                key={ex}
                onClick={() => { setQuery(ex); setTimeout(submit, 50) }}
                style={{
                  fontSize: '0.75rem', padding: '6px 14px',
                  borderRadius: 20, border: '1px solid #1e1e2e',
                  background: '#111118', color: '#64748b',
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.color = '#fff'
                  el.style.borderColor = 'rgba(99,102,241,0.4)'
                  el.style.background = '#16161f'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.color = '#64748b'
                  el.style.borderColor = '#1e1e2e'
                  el.style.background = '#111118'
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        </>
      )}

      <style>{`
        .search-box-wrap:focus-within {
          border-color: rgba(99,102,241,0.5) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1), 0 8px 40px rgba(0,0,0,0.5) !important;
        }
        textarea::placeholder { color: #334155; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
