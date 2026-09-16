// =============================================================
// src/components/colaboradores/ColaboradorTable.jsx
// -------------------------------------------------------------
// Vista de tabla de colaboradores (extraída de Colaboradores.jsx).
// =============================================================
import { CONCEPTO_COLORS } from '../../utils/parseExcel'
import { avatarColor, initials } from '../../utils/colaboradores'
import './colaboradores.css'

export default function ColaboradorTable({ paged, onSelect }) {
  return (
    <div className="table-container" style={{ marginBottom: 20, animation: 'fadeIn .25s ease' }}>
      <table>
        <thead>
          <tr>
            <th>Colaborador</th>
            <th>Área</th>
            <th style={{ textAlign: 'center' }}>Incapacidades</th>
            <th style={{ textAlign: 'center' }}>Días inc.</th>
            <th style={{ textAlign: 'center' }}>Días ausente</th>
            <th style={{ textAlign: 'center' }}>Tasa ausent.</th>
            <th style={{ textAlign: 'center' }}>Novedades</th>
            <th style={{ textAlign: 'center' }}>Conceptos</th>
            <th style={{ textAlign: 'center' }}>Reincidente</th>
          </tr>
        </thead>
        <tbody>
          {paged.map((col, idx) => {
            const [bg, fg] = avatarColor(col.nombre)
            return (
              <tr key={col.nombre} className="col-row" style={{ cursor: 'pointer', animationDelay: `${Math.min(idx, 8) * 0.03}s` }} onClick={() => onSelect(col)}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                      {initials(col.nombre)}
                    </div>
                    <span style={{ fontWeight: 600 }}>{col.nombre}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{col.area}</td>
                <td style={{ textAlign: 'center', fontWeight: 700, color: '#DC2626' }}>{col.episodiosInc}</td>
                <td style={{ textAlign: 'center' }}>
                  {col.diasInc > 0 && (
                    <span style={{ background: '#FEF2F2', color: '#991B1B', borderRadius: 999, padding: '2px 10px', fontWeight: 700, fontSize: 12 }}>
                      {col.diasInc.toFixed(0)}d
                    </span>
                  )}
                  {col.diasInc === 0 && <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {col.diasAusenteTotal > 0
                    ? <span style={{ color: 'var(--text-muted)' }}>{col.diasAusenteTotal.toFixed(0)}d</span>
                    : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {col.diasPeriodo > 0
                    ? <span style={{ fontWeight: 700, color: col.tasaAusentismo > 15 ? '#DC2626' : col.tasaAusentismo > 8 ? '#D97706' : '#0369A1' }}>{col.tasaAusentismo.toFixed(1)}%</span>
                    : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </td>
                <td style={{ textAlign: 'center', color: '#2563EB', fontWeight: 700 }}>{col.novedades.length}</td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {Object.keys(col.porConcepto).slice(0, 3).map(c => {
                      const color = CONCEPTO_COLORS[c] || '#374151'
                      return <span key={c} style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 999, background: color + '18', color }}>{c}</span>
                    })}
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  {col.episodiosInc >= 2
                    ? <span style={{ background: '#FEE2E2', color: '#991B1B', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>Sí</span>
                    : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}