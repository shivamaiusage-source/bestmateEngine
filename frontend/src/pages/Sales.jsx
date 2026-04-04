import { useState, useMemo } from 'react'
import { useMTDView } from '../hooks/useRMList'

/* ─── Formatters ──────────────────────────────────────────────── */
function fmtINR(val) {
  if (val === null || val === undefined || val === '') return '—'
  const n = Number(val)
  if (isNaN(n)) return '—'
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`
  return `₹${n.toLocaleString('en-IN')}`
}

function fmtPct(val) {
  if (val === null || val === undefined) return '—'
  const n = Number(val)
  if (isNaN(n)) return '—'
  return `${n.toFixed(2)}%`
}

function fmtNum(val) {
  if (val === null || val === undefined) return '0'
  return Number(val).toLocaleString('en-IN')
}

/* ─── Cell component ─────────────────────────────────────────── */
function Num({ val, money, pct, highlight }) {
  const text = money ? fmtINR(val) : pct ? fmtPct(val) : fmtNum(val)
  return (
    <span style={{
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: 12,
      color: highlight ? 'var(--accent-primary)' : 'inherit',
      fontWeight: highlight ? 600 : 400,
    }}>
      {text}
    </span>
  )
}

/* ─── MTD Table ──────────────────────────────────────────────── */
function MTDTable({ data, totals, loading }) {
  const thBase = {
    padding: '7px 10px',
    fontFamily: 'Syne, sans-serif',
    fontSize: 10,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    color: 'var(--text-secondary)',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-subtle)',
    whiteSpace: 'nowrap',
    textAlign: 'center',
  }

  const groupTh = (label, span, color) => (
    <th colSpan={span} style={{ ...thBase, background: color, color: '#e8f5e2', fontSize: 11 }}>
      {label}
    </th>
  )

  const subTh = (label) => (
    <th style={{ ...thBase }}>
      {label}
    </th>
  )

  const tdBase = {
    padding: '8px 10px',
    border: '1px solid var(--border-subtle)',
    fontSize: 12,
    textAlign: 'center',
    whiteSpace: 'nowrap',
  }

  const rows = loading
    ? Array.from({ length: 6 }).map((_, i) => ({ _skeleton: true, rm_name: i }))
    : [...(data ?? []), ...(totals ? [{ ...totals, is_total: true }] : [])]

  return (
    <div style={{ overflowX: 'auto', overflowY: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 1400 }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
          {/* ── Group header row ── */}
          <tr>
            <th rowSpan={2} style={{ ...thBase, minWidth: 140, textAlign: 'left' }}>Name</th>
            <th rowSpan={2} style={{ ...thBase, minWidth: 100 }}>Monthly<br/>Target</th>
            {groupTh('Achievement Till Date MF', 3, '#1a3d28')}
            <th rowSpan={2} style={{ ...thBase }}>Final<br/>Data</th>
            <th rowSpan={2} style={{ ...thBase }}>Final<br/>Achievement</th>
            <th rowSpan={2} style={{ ...thBase }}>This Month<br/>%</th>
            <th rowSpan={2} style={{ ...thBase }}>Demat<br/>Target</th>
            <th rowSpan={2} style={{ ...thBase }}>Demat<br/>Achieved</th>
            <th rowSpan={2} style={{ ...thBase }}>Achiev. Till<br/>Date Demat</th>
            <th rowSpan={2} style={{ ...thBase }}>MFD Onboard<br/>Target</th>
            <th rowSpan={2} style={{ ...thBase }}>MFD Onboard<br/>Done</th>
            <th rowSpan={2} style={{ ...thBase }}>EXAM Enroll<br/>Target</th>
            <th rowSpan={2} style={{ ...thBase }}>EXAM Enroll<br/>Done</th>
            <th rowSpan={2} style={{ ...thBase }}>New MFD Act.<br/>Target</th>
            <th rowSpan={2} style={{ ...thBase }}>New MFD Act.<br/>Done</th>
            {groupTh('ULIP', 2, '#2d1a4d')}
            {groupTh('Term Plan', 2, '#1a2d4d')}
            {groupTh('Traditional Plan', 2, '#1a4d3a')}
          </tr>
          {/* ── Sub-header row ── */}
          <tr>
            {subTh('SIP')}
            {subTh('Lumpsum')}
            {subTh('Bounce')}
            {subTh('Target')}{subTh('Achieved')}
            {subTh('Target')}{subTh('Achieved')}
            {subTh('Target')}{subTh('Achieved')}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, i) => {
            if (row._skeleton) {
              return (
                <tr key={i}>
                  {Array.from({ length: 22 }).map((_, j) => (
                    <td key={j} style={tdBase}>
                      <div style={{ height: 12, background: 'var(--bg-hover)', borderRadius: 4, animation: 'pulse 1.5s infinite' }}/>
                    </td>
                  ))}
                </tr>
              )
            }

            const isTotal = row.is_total
            const rowStyle = {
              background: isTotal
                ? 'rgba(141,198,63,0.08)'
                : i % 2 === 0 ? 'var(--bg-secondary)' : '#111f16',
            }
            const td = (children) => (
              <td style={{ ...tdBase, ...rowStyle, color: isTotal ? 'var(--accent-primary)' : 'var(--text-primary)',
                           fontWeight: isTotal ? 600 : 400 }}>
                {children}
              </td>
            )

            const pct = row.sip_target
              ? ((row.sip_achieved || 0) / row.sip_target * 100).toFixed(2) + '%'
              : '—'

            return (
              <tr key={row.id ?? row.rm_name ?? i}
                  onMouseEnter={e => { if (!isTotal) e.currentTarget.style.background = 'var(--bg-hover)' }}
                  onMouseLeave={e => { if (!isTotal) e.currentTarget.style.background = rowStyle.background }}>

                {/* Name */}
                <td style={{ ...tdBase, ...rowStyle, textAlign: 'left',
                             fontFamily: isTotal ? 'Syne, sans-serif' : 'inherit',
                             fontWeight: isTotal ? 700 : 500,
                             color: isTotal ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                  {row.rm_name ?? '—'}
                </td>

                {/* Monthly Target */}
                {td(<Num val={row.sip_target} money highlight={isTotal}/>)}

                {/* Achievement Till Date MF */}
                {td(<Num val={row.sip_achieved}       money/>)}
                {td(<Num val={row.lumpsum_fresh_done} money/>)}
                {td(<Num val={row.sip_bounce_amt}     money/>)}

                {/* Final Data */}
                {td(<Num val={row.sip_achieved} money/>)}

                {/* Final Achievement */}
                {td(<span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12,
                                   color: (row.final_achievement_pct ?? 0) >= 100
                                     ? 'var(--status-success)'
                                     : (row.final_achievement_pct ?? 0) >= 50
                                       ? 'var(--status-warning)'
                                       : 'var(--text-primary)' }}>
                  {fmtPct(row.final_achievement_pct)}
                </span>)}

                {/* This month % */}
                {td(<span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12 }}>{pct}</span>)}

                {/* Demat */}
                {td(<Num val={row.demat_ac_target}/>)}
                {td(<Num val={row.demat_ac_done}/>)}
                {td(<Num val={row.demat_amount_done} money/>)}

                {/* MFD Onboarding */}
                {td(<Num val={row.mfd_target}/>)}
                {td(<Num val={row.mfd_done}/>)}

                {/* EXAM Enrollment */}
                {td(<Num val={row.nism_target}/>)}
                {td(<Num val={row.nism_done}/>)}

                {/* New MFD Activation */}
                {td(<Num val={row.mfd_activation_target}/>)}
                {td(<Num val={row.mfd_activation_done}/>)}

                {/* ULIP */}
                {td(<Num val={row.ulip_target} money/>)}
                {td(<Num val={row.ulip_done}   money/>)}

                {/* Term Plan */}
                {td(<Num val={row.term_plan_target}/>)}
                {td(<Num val={row.term_plan_done}/>)}

                {/* Traditional Plan */}
                {td(<Num val={row.traditional_plan_target}/>)}
                {td(<Num val={row.traditional_plan_done}/>)}
              </tr>
            )
          })}
        </tbody>
      </table>
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
          <span style={{ display: 'inline-block' }}>⚙️</span>
          SALES ANALYTICS — PHASE 2
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{open ? '▼' : '▲'}</span>
      </button>
      {open && (
        <div className="flex flex-col items-center justify-center gap-3 py-10"
             style={{ border: '1px dashed var(--border-subtle)', borderRadius: 12, margin: '0 24px 16px' }}>
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

/* ─── Sales Page ─────────────────────────────────────────────── */
export default function Sales() {
  const { data: mtd, isLoading, error } = useMTDView()
  const [analyticsOpen, setAnalyticsOpen] = useState(false)

  const currentMonth = mtd?.month ?? '—'

  return (
    <div className="flex flex-col h-full">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-6 py-3 shrink-0"
           style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <h2 className="text-[15px] font-display font-semibold"
              style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>
            MTD Performance View
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-[11px]"
                style={{ background: 'rgba(141,198,63,0.12)', color: 'var(--accent-primary)',
                         fontFamily: 'IBM Plex Mono, monospace' }}>
            {currentMonth}
          </span>
          {mtd?.data && (
            <span className="px-2 py-0.5 rounded-full text-[11px]"
                  style={{ background: 'rgba(141,198,63,0.08)', color: 'var(--text-muted)',
                           fontFamily: 'IBM Plex Mono, monospace' }}>
              {mtd.data.length} RMs
            </span>
          )}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mx-6 mt-4 px-4 py-3 rounded-lg text-sm"
             style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                      color: 'var(--status-danger)' }}>
          {error.message}
        </div>
      )}

      {/* ── Table ── */}
      <div className="flex-1" style={{ minHeight: 0, overflow: 'auto' }}>
        <MTDTable
          data={mtd?.data}
          totals={mtd?.totals}
          loading={isLoading}
        />
      </div>

      {/* ── Analytics Placeholder ── */}
      <div className="shrink-0">
        <AnalyticsPlaceholder open={analyticsOpen} onToggle={() => setAnalyticsOpen(v => !v)} />
      </div>
    </div>
  )
}
