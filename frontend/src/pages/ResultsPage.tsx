import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { SlidersHorizontal, AlertCircle, Sparkles, RotateCcw, Home } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import FilterSidebar from '../components/FilterSidebar'
import ResultCard from '../components/ResultCard'
import ComparisonTable from '../components/ComparisonTable'
import LoadingState from '../components/LoadingState'
import { useToolSearch } from '../hooks/useToolSearch'
import type { SearchFilters } from '../types'

export default function ResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { data, loading, error, search } = useToolSearch()
  const [filters, setFilters] = useState<SearchFilters>({})
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const query = searchParams.get('q') ?? ''
  // Track last searched query+filters to avoid duplicate calls
  const lastSearchRef = useRef('')

  useEffect(() => {
    if (!query) return
    const key = `${query}__${JSON.stringify(filters)}`
    if (lastSearchRef.current === key) return
    lastSearchRef.current = key
    const hasFilters = filters.pricing?.length || filters.category
    search(query, hasFilters ? filters : undefined)
  }, [query, filters]) // eslint-disable-line

  const handleSearch = (newQuery: string) => {
    // Reset filters on new query
    setFilters({})
    lastSearchRef.current = ''
    setSearchParams({ q: newQuery })
  }

  const handleApplyFilters = () => {
    lastSearchRef.current = ''  // Force re-run
    const hasFilters = filters.pricing?.length || filters.category
    if (query) search(query, hasFilters ? filters : undefined)
    setSidebarOpen(false)
  }

  const filterCount = (filters.pricing?.length ?? 0) + (filters.category ? 1 : 0)

  return (
    <div style={{ minHeight: 'calc(100vh - 3.5rem)' }}>
      {/* Sticky search bar */}
      <div
        style={{
          position: 'sticky', top: 0, zIndex: 40,
          borderBottom: '1px solid #1e1e2e',
          padding: '10px 24px',
          backdropFilter: 'blur(12px)',
          background: 'rgba(10,10,15,0.9)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, maxWidth: 640 }}>
            <SearchBar
              onSearch={handleSearch}
              loading={loading}
              initialValue={query}
              size="compact"
              placeholder="Describe your task..."
            />
          </div>

          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="btn-ghost"
            style={{ position: 'relative', flexShrink: 0 }}
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
            {filterCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                width: 16, height: 16, borderRadius: '50%',
                background: '#6366f1', color: '#fff',
                fontSize: '0.5625rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {filterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px', display: 'flex', gap: 24 }}>
        {/* Filter sidebar */}
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          onApply={handleApplyFilters}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main */}
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Loading */}
          {loading && <LoadingState query={query} />}

          {/* Error */}
          {!loading && error && (
            <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '80px 0' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AlertCircle size={20} style={{ color: '#f87171' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.9375rem', marginBottom: 6 }}>Search failed</p>
                <p style={{ color: '#64748b', fontSize: '0.8125rem', maxWidth: 340 }}>{error}</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => search(query, filters)} className="btn-ghost" style={{ fontSize: '0.8125rem' }}>
                  <RotateCcw size={13} /> Try Again
                </button>
                <button onClick={() => navigate('/')} className="btn-ghost" style={{ fontSize: '0.8125rem' }}>
                  <Home size={13} /> Home
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          {!loading && !error && data && (
            <>
              {/* Meta bar */}
              <div
                className="animate-fade-in"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: 10,
                  padding: '10px 14px', borderRadius: 10,
                  background: '#111118', border: '1px solid #1e1e2e',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={13} style={{ color: '#a78bfa', flexShrink: 0 }} />
                  <p style={{ color: '#cbd5e1', fontSize: '0.8125rem' }}>{data.query_summary}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20,
                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                    fontSize: '0.6875rem', fontFamily: 'monospace', color: '#a78bfa',
                  }}>
                    {data.total} tool{data.total !== 1 ? 's' : ''} found
                  </span>
                  <span style={{ fontSize: '0.6875rem', fontFamily: 'monospace', color: '#334155' }}>
                    AI-ranked
                  </span>
                </div>
              </div>

              {/* Comparison table */}
              {data.comparison && <ComparisonTable data={data.comparison} />}

              {/* Tool cards */}
              {data.tools.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 16,
                }}>
                  {data.tools.map((tool, i) => (
                    <div
                      key={tool.id + i}
                      style={{
                        animation: `fade-up 0.4s ease-out ${i * 50}ms both`,
                      }}
                    >
                      <ResultCard tool={tool} rank={i + 1} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 12 }}>
                    No tools found matching your criteria.
                  </p>
                  <button
                    onClick={() => { setFilters({}); search(query) }}
                    className="btn-ghost"
                    style={{ fontSize: '0.8125rem' }}
                  >
                    Clear filters and retry
                  </button>
                </div>
              )}
            </>
          )}

          {/* Empty — no query */}
          {!loading && !error && !data && !query && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '80px 0' }}>
              <Sparkles size={32} style={{ color: '#1e1e2e' }} />
              <p style={{ color: '#475569', fontSize: '0.875rem' }}>Enter a task above to find AI tools.</p>
              <button onClick={() => navigate('/')} className="btn-primary" style={{ fontSize: '0.8125rem' }}>
                Go to Homepage
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
