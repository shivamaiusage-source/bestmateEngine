import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

/* ─── Bestmate Logo SVG (dark bg variant) ─────────────────────── */
const BestmateLogo = ({ size = 'md' }) => {
  const h = size === 'sm' ? 44 : size === 'lg' ? 88 : 64
  return (
    <svg viewBox="0 0 320 82" xmlns="http://www.w3.org/2000/svg" height={h}>
      <text x="2" y="60" fontFamily="Syne, sans-serif" fontWeight="800"
            fontSize="54" fill="#e8f5e2" letterSpacing="-2">BEST</text>
      <g transform="translate(158, 2)">
        <circle cx="13" cy="11" r="7.5" fill="#8dc63f"/>
        <path d="M4 28 Q13 16 22 28 L24 58 L16 58 L13 50 L10 58 L2 58 Z" fill="#8dc63f"/>
        <circle cx="34" cy="11" r="7.5" fill="#8dc63f"/>
        <path d="M26 28 Q34 16 43 28 L46 58 L37 58 L34 50 L31 58 L22 58 Z" fill="#8dc63f"/>
        <path d="M0 32 L13 16 L24 26 L34 16 L47 32"
              stroke="#8dc63f" strokeWidth="2.5" fill="none" opacity="0.5"/>
      </g>
      <text x="210" y="60" fontFamily="Syne, sans-serif" fontWeight="800"
            fontSize="54" fill="#e8f5e2" letterSpacing="-2">ATE</text>
      <text x="162" y="78" fontFamily="Inter, sans-serif" fontWeight="500"
            fontSize="10" fill="#4a6b42" textAnchor="middle" letterSpacing="5">
        INVEST WISELY
      </text>
    </svg>
  )
}

/* ─── Floating Particles ─────────────────────────────────────── */
const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: 8 + Math.random() * 84,
  delay: Math.random() * 4,
  duration: 3 + Math.random() * 3,
  size: 1.5 + Math.random() * 2,
}))

/* ─── Gear SVG path generator ───────────────────────────────── */
function gearPath(cx, cy, r, teeth, toothH, toothW) {
  const inner = r
  const outer = r + toothH
  const step = (2 * Math.PI) / teeth
  let d = ''
  for (let i = 0; i < teeth; i++) {
    const a0 = i * step - step * 0.35
    const a1 = i * step - step * 0.15
    const a2 = i * step + step * 0.15
    const a3 = i * step + step * 0.35
    if (i === 0) {
      d += `M ${cx + inner * Math.cos(a0)} ${cy + inner * Math.sin(a0)} `
    } else {
      d += `L ${cx + inner * Math.cos(a0)} ${cy + inner * Math.sin(a0)} `
    }
    d += `L ${cx + outer * Math.cos(a1)} ${cy + outer * Math.sin(a1)} `
    d += `L ${cx + outer * Math.cos(a2)} ${cy + outer * Math.sin(a2)} `
    d += `L ${cx + inner * Math.cos(a3)} ${cy + inner * Math.sin(a3)} `
  }
  d += 'Z'
  return d
}

/* ─── Investment Engine Animation ───────────────────────────── */
const InvestmentEngine = () => {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 50)
    return () => clearInterval(id)
  }, [])

  const t = tick * 0.05
  const bigAngle   =  t
  const midAngle   = -t * 1.67
  const smallAngle =  t * 2.35

  const cx = 220; const cy = 280

  const NODES = [
    { label: 'SIP',    angle: 0   },
    { label: 'AUM',    angle: 90  },
    { label: 'Target', angle: 180 },
    { label: 'NAV',    angle: 270 },
  ]

  const STREAMS = [0, 60, 120, 180, 240, 300].map(deg => {
    const rad = (deg * Math.PI) / 180
    const r1 = 130; const r2 = 58
    return {
      x1: cx + r1 * Math.cos(rad), y1: cy + r1 * Math.sin(rad),
      x2: cx + r2 * Math.cos(rad), y2: cy + r2 * Math.sin(rad),
      delay: deg / 60 * 0.33,
    }
  })

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background grid */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#8dc63f" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      </svg>

      {/* Floating particles */}
      {PARTICLES.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            bottom: `${10 + Math.random() * 30}%`,
            width:  p.size,
            height: p.size,
            background: 'rgba(141,198,63,0.5)',
            animation: `particleDrift ${p.duration}s ${p.delay}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* Main SVG engine */}
      <svg viewBox="0 0 440 560" xmlns="http://www.w3.org/2000/svg"
           className="w-full max-w-md relative z-10" style={{ maxHeight: '70vh' }}>
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8dc63f" stopOpacity="0.08"/>
            <stop offset="100%" stopColor="#0a1a0f" stopOpacity="0"/>
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Ambient glow */}
        <ellipse cx={cx} cy={cy} rx="140" ry="140" fill="url(#bgGlow)"/>

        {/* Data streams */}
        {STREAMS.map((s, i) => (
          <line key={i}
            x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
            stroke="#8dc63f" strokeWidth="1.2"
            strokeDasharray="6 5"
            style={{
              animation: `streamFlow 1.8s ${s.delay}s linear infinite`,
              opacity: 0.6,
            }}
          />
        ))}

        {/* Outer ring */}
        <circle cx={cx} cy={cy} r="120" fill="none" stroke="rgba(141,198,63,0.12)"
                strokeWidth="1" strokeDasharray="4 6"/>

        {/* Big center gear */}
        <g transform={`rotate(${bigAngle * 57.3} ${cx} ${cy})`} filter="url(#glow)">
          <path d={gearPath(cx, cy, 52, 14, 12, 8)}
                fill="#1a3d28" stroke="#8dc63f" strokeWidth="1.5"/>
          <circle cx={cx} cy={cy} r="20" fill="#152d1e" stroke="#8dc63f" strokeWidth="1.2"/>
          <circle cx={cx} cy={cy} r="8"  fill="#8dc63f" opacity="0.9"/>
        </g>

        {/* Mid gear (top-right) */}
        <g transform={`rotate(${midAngle * 57.3} ${cx + 108} ${cy - 50})`} filter="url(#glow)">
          <path d={gearPath(cx + 108, cy - 50, 30, 9, 8, 6)}
                fill="#152d1e" stroke="#8dc63f" strokeWidth="1.2"/>
          <circle cx={cx + 108} cy={cy - 50} r="11" fill="#0f2318" stroke="#8dc63f" strokeWidth="1"/>
          <circle cx={cx + 108} cy={cy - 50} r="4"  fill="#8dc63f" opacity="0.8"/>
        </g>

        {/* Small gear (bottom-right) */}
        <g transform={`rotate(${smallAngle * 57.3} ${cx + 95} ${cy + 80})`}>
          <path d={gearPath(cx + 95, cy + 80, 22, 7, 6, 5)}
                fill="#152d1e" stroke="#8dc63f" strokeWidth="1"/>
          <circle cx={cx + 95} cy={cy + 80} r="8"  fill="#0f2318" stroke="#8dc63f" strokeWidth="0.8"/>
          <circle cx={cx + 95} cy={cy + 80} r="3"  fill="#a8d94f" opacity="0.7"/>
        </g>

        {/* Orbiting nodes */}
        {NODES.map((n, i) => {
          const angle = ((n.angle + tick * 1.5) * Math.PI) / 180
          const rx = 100; const ry = 90
          const nx = cx + rx * Math.cos(angle)
          const ny = cy + ry * Math.sin(angle)
          const pulse = 1 + 0.15 * Math.sin(tick * 0.08 + i)
          return (
            <g key={n.label} transform={`translate(${nx},${ny})`}>
              <circle r="18" fill="#152d1e" stroke="#8dc63f" strokeWidth="1.2"
                      transform={`scale(${pulse})`} opacity="0.9"/>
              <text textAnchor="middle" dominantBaseline="middle"
                    fontFamily="Syne, sans-serif" fontSize="8.5"
                    fontWeight="700" fill="#8dc63f">
                {n.label}
              </text>
            </g>
          )
        })}

        {/* Logo */}
        <g transform="translate(20, 20)">
          <text x="0" y="46" fontFamily="Syne, sans-serif" fontWeight="800"
                fontSize="40" fill="#e8f5e2" letterSpacing="-1.5">BEST</text>
          <g transform="translate(118, 2)">
            <circle cx="10" cy="9" r="6"  fill="#8dc63f"/>
            <path d="M3 22 Q10 13 17 22 L19 46 L13 46 L10 39 L7 46 L1 46 Z" fill="#8dc63f"/>
            <circle cx="26" cy="9" r="6"  fill="#8dc63f"/>
            <path d="M19 22 Q26 13 33 22 L36 46 L30 46 L26 39 L23 46 L16 46 Z" fill="#8dc63f"/>
          </g>
          <text x="158" y="46" fontFamily="Syne, sans-serif" fontWeight="800"
                fontSize="40" fill="#e8f5e2" letterSpacing="-1.5">ATE</text>
          <text x="125" y="60" fontFamily="Inter, sans-serif" fontWeight="500"
                fontSize="8" fill="#4a6b42" textAnchor="middle" letterSpacing="4">
            INVEST WISELY
          </text>
        </g>

        {/* Subtitle */}
        <text x={cx} y={cy + 160} textAnchor="middle" fontFamily="Inter, sans-serif"
              fontSize="11" fill="#4a6b42" letterSpacing="2">
          INTERNAL ANALYTICS ENGINE
        </text>
      </svg>
    </div>
  )
}

/* ─── Login Page ─────────────────────────────────────────────── */
export default function Login() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authErr) {
      setError(authErr.message)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: '#0a1a0f' }}>

      {/* ── Left: Animated Engine ── */}
      <div className="hidden md:flex w-[55%] relative items-center justify-center"
           style={{ background: 'linear-gradient(135deg, #050f07 0%, #0a1a0f 40%, #0d2015 100%)' }}>
        <InvestmentEngine />
        {/* Corner accent */}
        <div className="absolute bottom-8 left-8 text-xs font-mono"
             style={{ color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
          PHASE 1 — LIVE
        </div>
      </div>

      {/* ── Right: Login Form ── */}
      <div className="w-full md:w-[45%] flex items-center justify-center px-8 py-12"
           style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-subtle)' }}>
        <div className="w-full max-w-sm animate-[fadeInUp_0.6s_ease-out]">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <BestmateLogo size="md" />
          </div>

          {/* Heading */}
          <h1 className="text-[28px] font-display font-700 mb-1"
              style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
            Welcome back
          </h1>
          <p className="text-[13px] mb-8"
             style={{ color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}>
            Bestmate Engine — Internal Dashboard
          </p>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs mb-2 uppercase tracking-widest"
                     style={{ color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="analyst@bestmate.in"
                required
                className="input-dark"
                style={{ fontFamily: 'IBM Plex Mono, monospace' }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs mb-2 uppercase tracking-widest"
                     style={{ color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="input-dark pr-12"
                  style={{ fontFamily: 'IBM Plex Mono, monospace' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm px-3 py-2 rounded-lg"
                   style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                            color: 'var(--status-danger)', fontFamily: 'Inter, sans-serif' }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-display font-bold text-[15px] transition-all duration-200 mt-2 relative overflow-hidden"
              style={{
                background: loading ? '#6a9a2e' : 'var(--accent-primary)',
                color: '#0a1a0f',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                boxShadow: loading ? 'none' : '0 0 20px rgba(141,198,63,0.25)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (!loading) { e.target.style.background = 'var(--accent-light)'; e.target.style.boxShadow = '0 0 28px rgba(141,198,63,0.45)' }}}
              onMouseLeave={e => { if (!loading) { e.target.style.background = 'var(--accent-primary)'; e.target.style.boxShadow = '0 0 20px rgba(141,198,63,0.25)' }}}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(10,26,15,0.3)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0110 10" stroke="#0a1a0f" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs mt-8"
             style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
            Bestmate Investment Services Pvt. Ltd.
            <br/>
            <span style={{ letterSpacing: '0.1em' }}>Internal use only</span>
          </p>
        </div>
      </div>
    </div>
  )
}
