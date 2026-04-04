import { useState } from 'react'

/* Reusable sortable/filterable dark data table */
export default function DataTable({ columns, data, loading, emptyMsg = 'No data' }) {
  const [sortCol, setSortCol]   = useState(null)
  const [sortDir, setSortDir]   = useState('asc')

  const handleSort = (key) => {
    if (sortCol === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(key); setSortDir('asc') }
  }

  let rows = [...(data ?? [])]
  if (sortCol) {
    rows.sort((a, b) => {
      const av = a[sortCol]; const bv = b[sortCol]
      if (av == null) return 1
      if (bv == null) return -1
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }

  return (
    <div className="overflow-auto w-full">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className={col.sortable ? 'sortable' : ''}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
                style={{ minWidth: col.minWidth, width: col.width }}
              >
                <span className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortCol === col.key && (
                    <span style={{ color: 'var(--accent-primary)' }}>
                      {sortDir === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                  {col.sortable && sortCol !== col.key && (
                    <span style={{ opacity: 0.3 }}>⇅</span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 7 }).map((_, i) => (
              <tr key={i}>
                {columns.map(col => (
                  <td key={col.key}>
                    <div className="h-4 rounded animate-pulse"
                         style={{ background: 'var(--bg-hover)', width: '70%' }}/>
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12"
                  style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
                {emptyMsg}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row.id ?? i}>
                {columns.map(col => (
                  <td key={col.key} style={col.tdStyle}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
