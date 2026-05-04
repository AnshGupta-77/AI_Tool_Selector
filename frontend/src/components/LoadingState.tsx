import { useEffect, useState } from 'react'
import { Sparkles, Database, Globe, Brain, BarChart3, CheckCircle2, Loader2 } from 'lucide-react'

interface Step {
  icon: React.ReactNode
  label: string
  duration: number
}

const STEPS: Step[] = [
  { icon: <Database size={13} />, label: 'Scanning curated tool database...', duration: 600 },
  { icon: <Globe size={13} />,    label: 'Running live web search...',         duration: 900 },
  { icon: <Brain size={13} />,    label: 'Analyzing your task with AI...',      duration: 700 },
  { icon: <Sparkles size={13} />, label: 'Ranking tools by relevance...',       duration: 500 },
  { icon: <BarChart3 size={13} />,label: 'Building comparison table...',        duration: 400 },
]

interface LoadingStateProps {
  query?: string
}

export default function LoadingState({ query }: LoadingStateProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    // Sequential step completion
    let currentStep = 0
    const timers: ReturnType<typeof setTimeout>[] = []

    const advance = () => {
      if (currentStep >= STEPS.length) return
      const step = currentStep
      const delay = STEPS.slice(0, step).reduce((sum, s) => sum + s.duration, 0)

      const t = setTimeout(() => {
        setActiveStep(step)
        const t2 = setTimeout(() => {
          setCompletedSteps(prev => [...prev, step])
          currentStep++
          advance()
        }, STEPS[step].duration)
        timers.push(t2)
      }, delay)
      timers.push(t)
    }

    advance()
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="w-full animate-fade-in">
      {/* Center panel */}
      <div className="flex flex-col items-center py-14 gap-7">
        {/* Animated icon */}
        <div className="relative">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center animate-glow-pulse"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)' }}
          >
            <Sparkles size={26} style={{ color: '#a78bfa' }} />
          </div>
          {/* Orbit ring */}
          <div
            className="absolute -inset-2 rounded-3xl border border-indigo-500/20 animate-spin-slow"
            style={{ borderTopColor: 'rgba(99,102,241,0.4)', borderRightColor: 'transparent' }}
          />
        </div>

        {/* Text */}
        <div className="text-center space-y-1.5">
          <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.9375rem' }}>
            Finding the best AI tools for your task
          </p>
          {query && (
            <p style={{ color: '#475569', fontSize: '0.75rem', fontFamily: 'monospace', maxWidth: '360px' }}
               className="truncate mx-auto">
              "{query}"
            </p>
          )}
        </div>

        {/* Step tracker */}
        <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {STEPS.map((step, i) => {
            const isDone = completedSteps.includes(i)
            const isActive = activeStep === i && !isDone
            const isPending = i > activeStep

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: isDone
                    ? 'rgba(34,197,94,0.25)'
                    : isActive
                    ? 'rgba(99,102,241,0.4)'
                    : '#1e1e2e',
                  background: isDone
                    ? 'rgba(34,197,94,0.07)'
                    : isActive
                    ? 'rgba(99,102,241,0.08)'
                    : '#111118',
                  animation: !isPending ? 'step-appear 0.3s ease-out both' : 'none',
                  animationDelay: `${i * 0.1}s`,
                  opacity: isPending ? 0.35 : 1,
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Icon / state indicator */}
                <div style={{
                  color: isDone ? '#22c55e' : isActive ? '#a78bfa' : '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}>
                  {isDone
                    ? <CheckCircle2 size={14} />
                    : isActive
                    ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    : step.icon
                  }
                </div>

                {/* Label */}
                <span style={{
                  fontSize: '0.75rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: isDone ? '#86efac' : isActive ? '#c4b5fd' : '#475569',
                  flex: 1,
                }}>
                  {step.label}
                </span>

                {/* Done tick */}
                {isDone && (
                  <span style={{ fontSize: '0.6875rem', color: '#22c55e', fontFamily: 'monospace' }}>✓</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Skeleton cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
        marginTop: '8px',
      }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} delay={i * 80} />
        ))}
      </div>
    </div>
  )
}

function SkeletonCard({ delay }: { delay: number }) {
  return (
    <div
      className="glass-card"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        animation: `fade-up 0.4s ease-out ${delay}ms both`,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="shimmer-line" style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="shimmer-line" style={{ height: 11, width: '65%', borderRadius: 4 }} />
          <div className="shimmer-line" style={{ height: 9, width: '35%', borderRadius: 4 }} />
        </div>
        <div className="shimmer-line" style={{ width: 62, height: 20, borderRadius: 20 }} />
      </div>
      {/* Content lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="shimmer-line" style={{ height: 9, width: '100%', borderRadius: 4 }} />
        <div className="shimmer-line" style={{ height: 9, width: '85%', borderRadius: 4 }} />
        <div className="shimmer-line" style={{ height: 9, width: '70%', borderRadius: 4 }} />
      </div>
      {/* Tags */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[40, 54, 38].map(w => (
          <div key={w} className="shimmer-line" style={{ width: w, height: 16, borderRadius: 6 }} />
        ))}
      </div>
      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid #1e1e2e' }}>
        <div className="shimmer-line" style={{ width: 80, height: 8, borderRadius: 4 }} />
        <div className="shimmer-line" style={{ width: 56, height: 8, borderRadius: 4 }} />
      </div>
    </div>
  )
}
