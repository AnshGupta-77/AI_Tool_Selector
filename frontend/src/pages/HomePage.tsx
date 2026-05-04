import { useNavigate } from 'react-router-dom'
import { Clock, X, Sparkles, ArrowRight, Zap } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import { getRecentSearches, clearRecentSearches } from '../hooks/useToolSearch'
import { useState } from 'react'

const CATEGORY_PILLS = [
  { label: 'Writing & Content', icon: '✍️', query: 'write and edit blog posts and marketing content' },
  { label: 'Code & Dev', icon: '💻', query: 'coding assistant and developer tools' },
  { label: 'Image & Art', icon: '🎨', query: 'generate and edit images and artwork' },
  { label: 'Video Creation', icon: '🎬', query: 'create and edit videos with AI' },
  { label: 'Audio & Music', icon: '🎵', query: 'generate music and voice audio content' },
  { label: 'Research', icon: '🔬', query: 'research and summarize documents and papers' },
  { label: 'Productivity', icon: '⚡', query: 'automate tasks and boost productivity' },
  { label: 'Design & UI', icon: '🖌️', query: 'design UI mockups and brand assets' },
]

const STATS = [
  { value: '150+', label: 'Curated Tools' },
  { value: '12', label: 'Categories' },
  { value: 'Live', label: 'Web Search' },
  { value: 'Free', label: 'Always' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [recents, setRecents] = useState(getRecentSearches)

  const handleSearch = (query: string) => {
    navigate(`/results?q=${encodeURIComponent(query)}`)
  }

  const handleClearRecents = () => {
    clearRecentSearches()
    setRecents([])
  }

  return (
    <main className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 py-24
                           bg-hero-gradient">
        {/* Grid bg */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-40 pointer-events-none" />

        {/* Badge */}
        <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-full
                         bg-accent-primary/10 border border-accent-primary/20 mb-8">
          <Sparkles size={12} className="text-accent-secondary" />
          <span className="text-xs font-mono text-accent-secondary">
            AI-powered tool discovery
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-1" />
        </div>

        {/* Headline */}
        <h1 className="relative text-4xl sm:text-5xl md:text-6xl font-extrabold text-center
                        leading-tight tracking-tight mb-4 max-w-3xl">
          Find the{' '}
          <span className="text-gradient">perfect AI tool</span>
          <br />
          for any task
        </h1>
        <p className="relative text-slate-400 text-center text-base sm:text-lg max-w-xl mb-12 leading-relaxed">
          Describe what you need to do. We'll search curated databases and the live web
          to recommend the best AI tools — with explanations tailored to your exact task.
        </p>

        {/* Search bar */}
        <div className="relative w-full max-w-3xl px-4">
          <SearchBar onSearch={handleSearch} size="hero" />
        </div>

        {/* Stats */}
        <div className="relative flex items-center gap-8 mt-14 flex-wrap justify-center">
          {STATS.map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-lg font-bold text-white font-mono">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Categories */}
      <section className="px-4 sm:px-6 py-12 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Zap size={14} className="text-accent-primary" />
            Quick Search by Category
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {CATEGORY_PILLS.map(cat => (
            <button
              key={cat.label}
              onClick={() => handleSearch(cat.query)}
              className="glass-card-hover flex items-center gap-3 px-4 py-3 text-left group"
            >
              <span className="text-xl leading-none">{cat.icon}</span>
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors leading-tight">
                {cat.label}
              </span>
              <ArrowRight size={12} className="ml-auto text-slate-600 group-hover:text-accent-secondary
                                               group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </section>

      {/* Recent searches */}
      {recents.length > 0 && (
        <section className="px-4 sm:px-6 pb-12 max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock size={13} className="text-slate-500" />
              Recent Searches
            </h2>
            <button
              onClick={handleClearRecents}
              className="text-xs text-slate-600 hover:text-white transition-colors flex items-center gap-1"
            >
              <X size={11} />
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recents.map(r => (
              <button
                key={r.query + r.timestamp}
                onClick={() => handleSearch(r.query)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs
                           bg-bg-elevated border border-bg-border text-slate-400
                           hover:text-white hover:border-accent-primary/30 transition-all group"
              >
                <Clock size={10} className="text-slate-600" />
                <span className="max-w-[180px] truncate">{r.query}</span>
                {r.resultsCount > 0 && (
                  <span className="font-mono text-slate-600 group-hover:text-accent-secondary text-[10px]">
                    {r.resultsCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="border-t border-bg-border py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-lg font-bold text-white mb-10">How ToolFind Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Describe your task', desc: 'Type naturally — "I want to turn my podcast into short YouTube clips" — no jargon needed.', icon: '💬' },
              { step: '02', title: 'AI searches everywhere', desc: 'We match against 150+ curated tools and run a live web search in parallel for the freshest results.', icon: '🔍' },
              { step: '03', title: 'Get ranked + explained', desc: 'Every recommendation explains exactly why it fits your task, with pricing and a side-by-side comparison.', icon: '✅' },
            ].map(item => (
              <div key={item.step} className="glass-card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[10px] font-mono text-slate-500">STEP {item.step}</span>
                </div>
                <h3 className="font-semibold text-white text-sm mb-1.5">{item.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
