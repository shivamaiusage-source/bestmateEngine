import { useState, useMemo } from 'react'
import { useRMList } from '../hooks/useRMList'
import DataTable from '../components/ui/DataTable'
import { StatusBadge, GradeBadge, NismBadge } from '../components/ui/Badge'
import { format, parseISO } from 'date-fns'

/* ─── Helpers ────────────────────────────────────────────────── */
function fmtINR(val) {
  if (!val) return '—'
  const n = Number(val)
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`
  return `₹${n.toLocaleString('en-IN')}`
}

function fmtDate(val) {
  if (!val) return '—'
  try { return format(parseISO(val), 'MMM yyyy') } catch { return val }
}

/* ─── Search Bar ─────────────────────────────────────────────── */
function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14"
           viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
           style={{ color: 'var(--text-muted)' }}>
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search RM name…"
        className="pl-9 pr-4 py-2 rounded-lg text-sm"
        style={{
          background:   'var(--bg-tertiary)',
          border:       '1px solid var(--border-default)',
          color:        'var(--text-primary)',
          fontFamily:   'IBM Plex Mono, monospace',
          fontSize:     '12px',
          width:        '220px',
        }}
      />
    </div>
  )
}

/* ─── Analytics Placeholder (collapsible) ────────────────────── */
function AnalyticsPlaceholder({ open, onToggle }) {
  return (
    <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
      {/* Toggle bar */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-2.5 transition-colors duration-150"
        style={{ background: 'var(--bg-secondary)', cursor: 'pointer', border: 'none' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
      >
        <span className="flex items-center gap-2 text-[12px]"
              style={{ color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif', letterSpacing: '0.08em' }}>
          <span style={{ animation: open ? 'spin 8s linear infinite' : 'none', display: 'inline-block' }}>⚙️</span>
          SALES ANALYTICS — PHASE 2
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{open ? '▼' : '▲'}</span>
      </button>

      {open && (
        <div className="flex flex-col items-center justify-center gap-3 py-10"
             style={{ border: '1px dashed var(--border-subtle)', borderRadius: 12,
                      margin: '0 24px 16px' }}>
          <p className="text-sm text-center max-w-sm"
             style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
            Coming in Phase 2 — SIP trends, target vs achievement charts, bounce rate analysis,
            RM performance scorecards.
          </p>
        </div>
      )}
    </div>
  )
}

/* ─── RM Table columns ───────────────────────────────────────── */
const COLUMNS = [
  {
    key: 'name', header: 'RM Name', minWidth: '160px',
    render: (v) => (
      <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: 'var(--text-primary)' }}>
        {v}
      </span>
    ),
  },
  { key: 'city', header: 'City', minWidth: '100px' },
  {
    key: 'date_of_joining', header: 'Since', minWidth: '90px',
    render: (v) => <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>{fmtDate(v)}</span>,
  },
  {
    key: 'salary', header: 'Salary', minWidth: '110px', sortable: true,
    render: (v) => (
      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--text-secondary)' }}>
        {v ? `₹${Number(v).toLocaleString('en-IN')}` : '—'}
      </span>
    ),
  },
  {
    key: 'sip_target_monthly', header: 'SIP Target', minWidth: '110px', sortable: true,
    render: (v) => (
      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--accent-primary)', fontWeight: 600 }}>
        {fmtINR(v)}
      </span>
    ),
  },
  {
    key: 'active_ap_till_date', header: 'Active APs', minWidth: '90px', sortable: true,
    render: (v) => (
      <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, color: 'var(--text-primary)' }}>
        {v ?? 0}
      </span>
    ),
  },
  {
    key: 'grade', header: 'Grade', minWidth: '80px',
    render: (v) => <GradeBadge grade={v} />,
  },
  {
    key: 'nism_status', header: 'NISM', minWidth: '60px',
    render: (v) => <NismBadge status={v} />,
  },
  {
    key: '_action', header: '', minWidth: '100px',
    render: (_, row) => (
      <button
        className="px-3 py-1 rounded-lg text-[11px] font-display font-600 transition-colors duration-150"
        style={{
          background:  'transparent',
          border:      '1px solid var(--border-default)',
          color:       'var(--text-secondary)',
          fontFamily:  'Syne, sans-serif',
          cursor:      'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-active)'; e.currentTarget.style.color = 'var(--accent-primary)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent';       e.currentTarget.style.color = 'var(--text-secondary)' }}
        onClick={() => alert(`RM detail page coming in Phase 2 — ${row.name}`)}
      >
        View Details
      </button>
    ),
  },
]

/* ─── Sales Page ─────────────────────────────────────────────── */
export default function Sales() {
  const { data, isLoading, error } = useRMList()
  const [search, setSearch] = useState('')
  const [analyticsOpen, setAnalyticsOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!data) return []
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter(rm => rm.name?.toLowerCase().includes(q))
  }, [data, search])

  return (
    <div className="flex flex-col h-full">

      {/* ── Table section ── */}
      <div className="flex-1 flex flex-col" style={{ minHeight: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 shrink-0"
             style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <h2 className="text-[15px] font-display font-semibold"
                style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>
              Relationship Managers
            </h2>
            {data && (
              <span className="px-2 py-0.5 rounded-full text-[11px]"
                    style={{ background: 'rgba(141,198,63,0.12)', color: 'var(--accent-primary)',
                             fontFamily: 'IBM Plex Mono, monospace' }}>
                {filtered.length}
              </span>
            )}
          </div>
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-lg text-sm"
               style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                        color: 'var(--status-danger)' }}>
            Failed to load RM list: {error.message}
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <DataTable
            columns={COLUMNS}
            data={filtered}
            loading={isLoading}
            emptyMsg="No relationship managers found"
          />
        </div>
      </div>

      {/* ── Analytics Placeholder ── */}
      <div className="shrink-0">
        <AnalyticsPlaceholder open={analyticsOpen} onToggle={() => setAnalyticsOpen(v => !v)} />
      </div>
    </div>
  )
}
