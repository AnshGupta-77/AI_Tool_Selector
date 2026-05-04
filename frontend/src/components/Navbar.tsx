import { Link, useLocation } from 'react-router-dom'
import { Zap, Grid3X3, Github } from 'lucide-react'
import clsx from 'clsx'

export default function Navbar() {
  const location = useLocation()

  const links = [
    { to: '/', label: 'Search', icon: Zap },
    { to: '/browse', label: 'Browse', icon: Grid3X3 },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-bg-border"
      style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-accent-primary flex items-center justify-center
                          group-hover:shadow-[0_0_16px_rgba(99,102,241,0.5)] transition-shadow">
            <Zap size={14} className="text-white fill-white" />
          </div>
          <span className="font-semibold text-white text-sm tracking-tight">
            Tool<span className="text-gradient">Find</span>
            <span className="font-mono text-[10px] text-slate-500 ml-1">AI</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-accent-glow text-white border border-accent-primary/30'
                    : 'text-slate-400 hover:text-white hover:bg-bg-elevated'
                )}
              >
                <Icon size={13} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-xs py-1.5 px-3"
          >
            <Github size={13} />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md
                          bg-bg-elevated border border-bg-border">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-mono text-slate-500">API LIVE</span>
          </div>
        </div>
      </div>
    </header>
  )
}
