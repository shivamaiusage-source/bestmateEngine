/* Generic status / grade badge */
const STATUS_COLORS = {
  Complete:  { bg: 'rgba(74,222,128,0.15)',  border: 'rgba(74,222,128,0.4)',  text: '#4ade80' },
  Inprocess: { bg: 'rgba(251,191,36,0.15)',  border: 'rgba(251,191,36,0.4)',  text: '#fbbf24' },
  Pending:   { bg: 'rgba(96,165,250,0.15)',  border: 'rgba(96,165,250,0.4)',  text: '#60a5fa' },
  Rejected:  { bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.4)', text: '#f87171' },
  Uploaded:  { bg: 'rgba(141,198,63,0.12)',  border: 'rgba(141,198,63,0.3)',  text: '#8dc63f' },
  'Not Uploaded': { bg: 'rgba(74,107,66,0.15)', border: 'rgba(74,107,66,0.4)', text: '#4a6b42' },
}

const GRADE_COLORS = {
  'A+':  { bg: 'rgba(141,198,63,0.15)',  border: 'rgba(141,198,63,0.4)',  text: '#8dc63f'  },
  'AA+': { bg: 'rgba(251,191,36,0.15)',  border: 'rgba(251,191,36,0.4)',  text: '#fbbf24'  },
  'A':   { bg: 'rgba(96,165,250,0.15)',  border: 'rgba(96,165,250,0.4)',  text: '#60a5fa'  },
  'B':   { bg: 'rgba(96,165,250,0.1)',   border: 'rgba(96,165,250,0.3)',  text: '#93c5fd'  },
  'C':   { bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.3)', text: '#f87171'  },
}

export function StatusBadge({ status }) {
  const style = STATUS_COLORS[status] ?? {
    bg: 'rgba(74,107,66,0.1)', border: 'rgba(74,107,66,0.3)', text: '#4a6b42'
  }
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap inline-block"
          style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text,
                   fontFamily: 'Inter, sans-serif' }}>
      {status ?? '—'}
    </span>
  )
}

export function GradeBadge({ grade }) {
  if (!grade) return <span style={{ color: 'var(--text-muted)' }}>—</span>
  const style = GRADE_COLORS[grade] ?? {
    bg: 'rgba(74,107,66,0.1)', border: 'rgba(74,107,66,0.3)', text: '#4a6b42'
  }
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap inline-block"
          style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text,
                   fontFamily: 'Syne, sans-serif' }}>
      {grade}
    </span>
  )
}

export function NismBadge({ status }) {
  const cleared = status?.toLowerCase().includes('cleared')
  return (
    <span className="text-[13px]" title={status}>
      {cleared
        ? <span style={{ color: 'var(--status-success)' }}>✓</span>
        : <span style={{ color: 'var(--status-danger)' }}>✗</span>
      }
    </span>
  )
}
