export default function StatCard({ title, value, sub, accent = false, icon }) {
  return (
    <div className="rounded-xl p-5 flex flex-col gap-1 transition-all duration-200"
         style={{
           background:  'var(--bg-secondary)',
           border:      accent ? '1px solid var(--border-default)' : '1px solid var(--border-subtle)',
           boxShadow:   accent ? '0 0 20px rgba(141,198,63,0.08)' : 'none',
         }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] uppercase tracking-widest"
              style={{ color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif' }}>
          {title}
        </span>
        {icon && <span className="text-base opacity-60">{icon}</span>}
      </div>
      <div className="text-[26px] font-bold leading-tight"
           style={{
             color:      accent ? 'var(--accent-primary)' : 'var(--text-primary)',
             fontFamily: 'IBM Plex Mono, monospace',
           }}>
        {value ?? '—'}
      </div>
      {sub && (
        <div className="text-[11px]" style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
          {sub}
        </div>
      )}
    </div>
  )
}
