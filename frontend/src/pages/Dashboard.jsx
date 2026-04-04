import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAppStore } from '../store/useAppStore'
import Sales      from './Sales'
import Operations from './Operations'

/* ─── Bestmate Mini Logo ─────────────────────────────────────── */
const LogoMini = () => (
  <svg viewBox="0 0 260 48" xmlns="http://www.w3.org/2000/svg" height="36">
    <text x="0" y="36" fontFamily="Syne, sans-serif" fontWeight="800"
          fontSize="34" fill="#e8f5e2" letterSpacing="-1">BEST</text>
    <g transform="translate(100, 1)">
      <circle cx="9"  cy="7" r="5"  fill="#8dc63f"/>
      <path d="M2 18 Q9 10 16 18 L18 38 L12 38 L9 32 L6 38 L0 38 Z" fill="#8dc63f"/>
      <circle cx="24" cy="7" r="5"  fill="#8dc63f"/>
      <path d="M17 18 Q24 10 31 18 L33 38 L27 38 L24 32 L21 38 L14 38 Z" fill="#8dc63f"/>
    </g>
    <text x="137" y="36" fontFamily="Syne, sans-serif" fontWeight="800"
          fontSize="34" fill="#e8f5e2" letterSpacing="-1">ATE</text>
  </svg>
)

/* ─── Top Bar ─────────────────────────────────────────────────── */
function TopBar({ activeTab, setActiveTab, user, onLogout }) {
  return (
    <header className="flex items-center justify-between px-6 h-[60px] shrink-0"
            style={{ background: 'var(--bg-secondary)',
                     borderBottom: '1px solid var(--border-subtle)' }}>
      {/* Left: Logo */}
      <div className="flex items-center gap-6">
        <LogoMini />
        {/* Tab switcher */}
        <nav className="flex items-center gap-2">
          {['sales', 'operations'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-1.5 rounded-full text-[13px] font-display font-600 capitalize transition-all duration-200"
              style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 600,
                background: activeTab === tab ? 'var(--accent-primary)' : 'transparent',
                color:      activeTab === tab ? '#0a1a0f' : 'var(--text-secondary)',
                border:     activeTab === tab ? 'none' : '1px solid var(--border-default)',
              }}
            >
              {tab === 'sales' ? '📈 Sales' : '⚙️ Operations'}
            </button>
          ))}
        </nav>
      </div>

      {/* Right: User + Logout */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono hidden sm:block"
              style={{ color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono, monospace' }}>
          {user?.email}
        </span>
        <button
          onClick={onLogout}
          title="Sign out"
          className="p-2 rounded-lg transition-colors duration-150"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--status-danger)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent';      e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </header>
  )
}

/* ─── Dashboard Shell ─────────────────────────────────────────── */
export default function Dashboard() {
  const { activeTab, setActiveTab, user } = useAppStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg-primary)' }}>
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-hidden">
        {activeTab === 'sales'      && <Sales />}
        {activeTab === 'operations' && <Operations />}
      </main>
    </div>
  )
}
