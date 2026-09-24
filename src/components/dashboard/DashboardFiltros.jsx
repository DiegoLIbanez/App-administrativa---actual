import { X } from 'lucide-react'
import { MESES_DASHBOARD as MESES } from '../../utils/dashboardConstants'

const pillStyle = (activo) => ({
  padding: '4px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: 'none',
  background: activo ? 'var(--primary)' : 'var(--bg)',
  color: activo ? '#fff' : 'var(--text-muted)',
  outline: activo ? 'none' : '1px solid var(--border)',
  fontWeight: activo ? 600 : 400,
})

export default function DashboardFiltros({
  aniosDisponibles, filterAnio, setFilterAnio,
  filterMeses, setFilterMeses, toggleMes,
  periodosDisponibles, filterPeriodo, setFilterPeriodo,
  filterConcepto, setFilterConcepto,
  filterDependencia, setFilterDependencia,
  dataLength, hasFilter, clearFilters,
}) {
  return (
    <div className="card" style={{ marginBottom: 16, padding: '14px 16px' }}>
      {/* ── Fila 1: Año ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', width: 60, flexShrink: 0 }}>AÑO</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => { setFilterAnio(''); setFilterMeses([]); setFilterPeriodo('') }}
            style={pillStyle(!filterAnio)}
          >Todos</button>
          {aniosDisponibles.map(a => (
            <button key={a}
              onClick={() => { setFilterAnio(a); setFilterMeses([]); setFilterPeriodo('') }}
              style={pillStyle(filterAnio === a)}
            >{a}</button>
          ))}
        </div>
      </div>

      {/* ── Fila 2: Mes (solo si hay año seleccionado) — multi-selección para rango ── */}
      {filterAnio && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', width: 60, flexShrink: 0, marginTop: 4 }}>MES</span>
          <div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                onClick={() => setFilterMeses([])}
                style={pillStyle(filterMeses.length === 0)}
              >Todos</button>
              {MESES.map(m => {
                const seleccionado = filterMeses.includes(m.val)
                const enRango = !seleccionado && filterMeses.length > 1 &&
                  m.val > filterMeses[0] && m.val < filterMeses[filterMeses.length - 1]
                return (
                  <button key={m.val}
                    onClick={() => { toggleMes(m.val); setFilterPeriodo('') }}
                    style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: 'none',
                      background: seleccionado ? 'var(--primary)' : enRango ? 'color-mix(in srgb, var(--primary) 18%, var(--bg))' : 'var(--bg)',
                      color: seleccionado ? '#fff' : 'var(--text-muted)',
                      outline: seleccionado ? 'none' : '1px solid var(--border)',
                      fontWeight: seleccionado ? 600 : 400,
                    }}
                  >{m.label.substring(0, 3)}</button>
                )
              })}
            </div>
            {filterMeses.length > 1 && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                Rango: {MESES.find(m => m.val === filterMeses[0])?.label} – {MESES.find(m => m.val === filterMeses[filterMeses.length - 1])?.label} {filterAnio}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Fila 3: Periodo ── */}
      {periodosDisponibles.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', width: 60, flexShrink: 0 }}>PERIODO</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterPeriodo('')}
              style={pillStyle(!filterPeriodo)}
            >Todos</button>
            {periodosDisponibles.map(p => (
              <button key={p}
                onClick={() => { setFilterPeriodo(filterPeriodo === p ? '' : p); setFilterAnio(''); setFilterMeses([]) }}
                style={pillStyle(filterPeriodo === p)}
              >{p}</button>
            ))}
          </div>
        </div>
      )}

      {/* ── Fila 4: Concepto ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', width: 60, flexShrink: 0 }}>CONCEPTO</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterConcepto('')}
            style={pillStyle(!filterConcepto)}
          >Todos</button>
          {['Incapacidad', 'LNR', 'LR'].map(c => (
            <button key={c}
              onClick={() => setFilterConcepto(filterConcepto === c ? '' : c)}
              style={pillStyle(filterConcepto === c)}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* ── Fila: filtro de área activo (drill-down desde gráficas) ── */}
      {filterDependencia && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', width: 60, flexShrink: 0 }}>ÁREA</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20,
            fontSize: 12, fontWeight: 600, background: 'var(--info-bg)', color: 'var(--info-text)',
          }}>
            {filterDependencia}
            <X size={13} style={{ cursor: 'pointer' }} onClick={() => setFilterDependencia('')} />
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>seleccionada al hacer clic en una gráfica de área</span>
        </div>
      )}

      {/* ── Fila 4: Contador + limpiar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {dataLength.toLocaleString()} registro{dataLength !== 1 ? 's' : ''} {hasFilter ? 'filtrados' : 'totales'}
        </span>
        {hasFilter && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <X size={13} /> Limpiar filtros
          </button>
        )}
      </div>
    </div>
  )
}
