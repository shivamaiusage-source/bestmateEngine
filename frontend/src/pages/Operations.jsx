import { useState, useMemo } from 'react'
import { useOpsTasks, useOpsSummary } from '../hooks/useOpsTasks'
import DataTable from '../components/ui/DataTable'
import StatCard  from '../components/ui/StatCard'
import { StatusBadge } from '../components/ui/Badge'
import { format, parseISO, differenceInDays } from 'date-fns'

/* ─── Helpers ────────────────────────────────────────────────── */
function fmtDate(val) {
  if (!val) return '—'
  try { return format(parseISO(val), 'dd MMM yyyy') } catch { return val }
}

function computeTAT(startDate, endDate) {
  if (!startDate || !endDate) return null
  try {
    return differenceInDays(parseISO(endDate), parseISO(startDate))
  } catch { return null }
}

/* ─── Select Filter ──────────────────────────────────────────── */
function SelectFilter({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-widest"
             style={{ color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif' }}>
        {label}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="px-3 py-1.5 rounded-lg text-[12px]"
        style={{
          background:  'var(--bg-tertiary)',
          border:      '1px solid var(--border-default)',
          color:       value ? 'var(--text-primary)' : 'var(--text-muted)',
          fontFamily:  'IBM Plex Mono, monospace',
          minWidth:    '140px',
          cursor:      'pointer',
        }}
      >
        <option value="">All</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

/* ─── Date Filter ────────────────────────────────────────────── */
function DateFilter({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-widest"
             style={{ color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif' }}>
        {label}
      </label>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="px-3 py-1.5 rounded-lg text-[12px]"
        style={{
          background:  'var(--bg-tertiary)',
          border:      '1px solid var(--border-default)',
          color:       'var(--text-primary)',
          fontFamily:  'IBM Plex Mono, monospace',
          colorScheme: 'dark',
        }}
      />
    </div>
  )
}

/* ─── Analytics Placeholder (collapsible) ────────────────────── */
function AnalyticsPlaceholder({ open, onToggle }) {
  return (
    <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
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
          OPERATIONS ANALYTICS — PHASE 2
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{open ? '▼' : '▲'}</span>
      </button>

      {open && (
        <div className="flex flex-col items-center justify-center gap-3 py-10"
             style={{ border: '1px dashed var(--border-subtle)', borderRadius: 12,
                      margin: '0 24px 16px' }}>
          <p className="text-sm text-center max-w-sm"
             style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
            Coming in Phase 2 — Task completion rates, TAT analysis, RM workload distribution,
            rejection reason breakdown.
          </p>
        </div>
      )}
    </div>
  )
}

/* ─── Ops Task Table Columns ─────────────────────────────────── */
function buildColumns() {
  return [
    {
      key: 'ops_member_name', header: 'Ops Member', minWidth: '120px',
      render: (v) => (
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: 'var(--text-primary)' }}>{v}</span>
      ),
    },
    { key: 'client_name', header: 'Client', minWidth: '150px' },
    {
      key: 'rm_name', header: 'Assigned by RM', minWidth: '130px',
      render: (v) => v
        ? <span style={{ color: 'var(--accent-primary)', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>{v}</span>
        : <span style={{ color: 'var(--text-muted)' }}>—</span>,
    },
    { key: 'task_name', header: 'Task', minWidth: '160px' },
    {
      key: 'task_status', header: 'Status', minWidth: '110px',
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: 'document_status', header: 'Documents', minWidth: '110px',
      render: (v) => {
        if (!v) return <span style={{ color: 'var(--text-muted)' }}>—</span>
        const color = v === 'Uploaded' ? 'var(--status-success)' : 'var(--text-muted)'
        return <span style={{ color, fontSize: 12 }}>{v}</span>
      },
    },
    {
      key: 'start_date', header: 'Start Date', minWidth: '110px', sortable: true,
      render: (v) => <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>{fmtDate(v)}</span>,
    },
    {
      key: 'end_date', header: 'End Date', minWidth: '110px', sortable: true,
      render: (v) => <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>{fmtDate(v)}</span>,
    },
    {
      key: '_tat', header: 'TAT (days)', minWidth: '90px', sortable: false,
      render: (_, row) => {
        const tat = computeTAT(row.start_date, row.end_date)
        if (tat === null) return <span style={{ color: 'var(--text-muted)' }}>—</span>
        const color = tat > 3 ? 'var(--status-danger)' : tat > 1 ? 'var(--status-warning)' : 'var(--status-success)'
        return (
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color, fontWeight: 600 }}>
            {tat}d
          </span>
        )
      },
    },
    {
      key: 'rejected_reason', header: 'Rejected Reason', minWidth: '160px',
      render: (v) => v
        ? <span style={{ color: 'var(--status-danger)', fontSize: 12 }}>{v}</span>
        : <span style={{ color: 'var(--text-muted)' }}>—</span>,
    },
  ]
}

/* ─── Operations Page ─────────────────────────────────────────── */
export default function Operations() {
  const [analyticsOpen, setAnalyticsOpen] = useState(false)
  const [filters, setFilters] = useState({
    ops_member: '', rm_name: '', task_name: '', status: '',
    start_from: '', start_to: '',
  })

  const { data: summary } = useOpsSummary()
  const { data, isLoading, error } = useOpsTasks(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
  )

  /* Local filter options derived from data */
  const OPS_MEMBERS = useMemo(() => [...new Set((data ?? []).map(r => r.ops_member_name).filter(Boolean))].sort(), [data])
  const RM_NAMES    = useMemo(() => [...new Set((data ?? []).map(r => r.rm_name).filter(Boolean))].sort(), [data])
  const TASK_NAMES  = useMemo(() => [...new Set((data ?? []).map(r => r.task_name).filter(Boolean))].sort(), [data])
  const STATUSES    = ['Complete', 'Inprocess', 'Pending', 'Rejected']

  const set = (key) => (val) => setFilters(f => ({ ...f, [key]: val }))
  const clearFilters = () => setFilters({ ops_member: '', rm_name: '', task_name: '', status: '', start_from: '', start_to: '' })
  const hasFilters   = Object.values(filters).some(Boolean)

  const columns = buildColumns()

  return (
    <div className="flex flex-col h-full">

      {/* ── Summary Cards ── */}
      {summary && (
        <div className="grid grid-cols-5 gap-3 px-6 py-4 shrink-0"
             style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <StatCard title="Total Tasks"    value={summary.total}           icon="📋"/>
          <StatCard title="Complete"       value={summary.complete}        icon="✅" accent/>
          <StatCard title="In Process"     value={summary.inprocess}       icon="⏳"/>
          <StatCard title="Pending"        value={summary.pending}         icon="🔵"/>
          <StatCard title="Completion Rate" value={`${summary.completion_rate}%`} icon="📊" accent/>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-end gap-4 px-6 py-3 shrink-0"
           style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
        <SelectFilter label="Ops Member" value={filters.ops_member} onChange={set('ops_member')} options={OPS_MEMBERS}/>
        <SelectFilter label="RM Name"    value={filters.rm_name}    onChange={set('rm_name')}    options={RM_NAMES}/>
        <SelectFilter label="Task"       value={filters.task_name}  onChange={set('task_name')}  options={TASK_NAMES}/>
        <SelectFilter label="Status"     value={filters.status}     onChange={set('status')}     options={STATUSES}/>
        <DateFilter   label="Start From" value={filters.start_from} onChange={set('start_from')}/>
        <DateFilter   label="Start To"   value={filters.start_to}   onChange={set('start_to')}/>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-1.5 rounded-lg text-[12px] transition-colors"
            style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                     color: 'var(--status-danger)', cursor: 'pointer', fontFamily: 'Syne, sans-serif',
                     alignSelf: 'flex-end' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Table Header ── */}
      <div className="flex items-center justify-between px-6 py-2.5 shrink-0"
           style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <h2 className="text-[15px] font-display font-semibold"
              style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>
            Client Task Log
          </h2>
          {data && (
            <span className="px-2 py-0.5 rounded-full text-[11px]"
                  style={{ background: 'rgba(141,198,63,0.12)', color: 'var(--accent-primary)',
                           fontFamily: 'IBM Plex Mono, monospace' }}>
              {data.length}
            </span>
          )}
        </div>
        <span className="text-[11px]"
              style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
          RM → Ops assignment log
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-3 px-4 py-3 rounded-lg text-sm"
             style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                      color: 'var(--status-danger)' }}>
          Failed to load tasks: {error.message}
        </div>
      )}

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto" style={{ minHeight: 0 }}>
        <DataTable
          columns={columns}
          data={data}
          loading={isLoading}
          emptyMsg="No tasks found for selected filters"
        />
      </div>

      {/* ── Analytics Placeholder ── */}
      <div className="shrink-0">
        <AnalyticsPlaceholder open={analyticsOpen} onToggle={() => setAnalyticsOpen(v => !v)} />
      </div>
    </div>
  )
}
