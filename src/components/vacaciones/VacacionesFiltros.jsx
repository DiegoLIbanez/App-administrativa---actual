import { Search, X } from 'lucide-react'
import { MESES, ESTADOS, TIPOS_VACACION, DEPENDENCIAS } from '../../utils/vacacionesConstants'

export default function VacacionesFiltros({
  rows, filtered, hayFiltros, clearFilters, activeChips,
  search, setSearch,
  filterAnio, setFilterAnio, aniosDisponibles,
  filterMes, setFilterMes,
  filterEstado, setFilterEstado,
  filterTipo, setFilterTipo,
  filterDep, setFilterDep,
  viewMode, setViewMode,
  setPage,
}) {
  return (
    <>
      {/* ── Tabs por Dependencia ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button
          className={`vac-tab ${filterDep === '' ? 'active' : ''}`}
          onClick={() => { setFilterDep(''); setPage(1) }}
        >
          Todas
          <span style={{
            background: filterDep === '' ? 'rgba(255,255,255,.3)' : 'var(--bg)',
            borderRadius: 999, padding: '1px 7px', fontSize: 11,
          }}>{rows.length}</span>
        </button>
        {DEPENDENCIAS.filter(dep => rows.some(r => r.dependencia === dep)).map(dep => {
          const count = rows.filter(r => r.dependencia === dep).length
          const active = filterDep === dep
          return (
            <button
              key={dep}
              className={`vac-tab ${active ? 'active' : ''}`}
              onClick={() => { setFilterDep(active ? '' : dep); setPage(1) }}
            >
              {dep}
              <span style={{
                background: active ? 'rgba(255,255,255,.3)' : 'var(--bg)',
                borderRadius: 999, padding: '1px 7px', fontSize: 11,
              }}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* ── Filtros ───────────────────────────────────────────────────────── */}
      <div className="filters-row" style={{ flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {/* Búsqueda */}
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-control search-input"
            style={{ paddingLeft: 32 }}
            placeholder="Buscar empleado, área..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <select className="form-control" style={{ flex: '0 0 100px' }} value={filterAnio}
          onChange={e => { setFilterAnio(e.target.value); setPage(1) }}>
          <option value="">Año</option>
          {aniosDisponibles.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <select className="form-control" style={{ flex: '0 0 140px' }} value={filterMes}
          onChange={e => { setFilterMes(e.target.value); setPage(1) }}>
          <option value="">Todos los meses</option>
          {MESES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <select className="form-control" style={{ flex: '0 0 150px' }} value={filterEstado}
          onChange={e => { setFilterEstado(e.target.value); setPage(1) }}>
          <option value="">Todos los estados</option>
          {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select className="form-control" style={{ flex: '0 0 190px' }} value={filterTipo}
          onChange={e => { setFilterTipo(e.target.value); setPage(1) }}>
          <option value="">Todos los tipos</option>
          {TIPOS_VACACION.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Toggle vista tabla / cards */}
        <div style={{ display: 'flex', gap: 2, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 2, flexShrink: 0 }}>
          <button className="vac-view-btn" onClick={() => setViewMode('table')} title="Vista tabla"
            style={{ background: viewMode === 'table' ? 'var(--surface)' : 'transparent', color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
            ≡
          </button>
          <button className="vac-view-btn" onClick={() => setViewMode('cards')} title="Vista tarjetas"
            style={{ background: viewMode === 'cards' ? 'var(--surface)' : 'transparent', color: viewMode === 'cards' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: viewMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
            ⊞
          </button>
        </div>

        {hayFiltros && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}><X size={13} /> Limpiar todo</button>
        )}
      </div>

      {/* ── Chips de filtros activos ─────────────────────────────────────── */}
      {activeChips.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {activeChips.map((chip, i) => (
            <span key={i} className="vac-chip" style={{ animationDelay: `${i * 0.05}s` }}>
              {chip.label}
              <button onClick={chip.clear} title="Quitar filtro"><X size={10} /></button>
            </span>
          ))}
        </div>
      )}

      {/* Contador */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: 12, color: 'var(--text-muted)' }}>
        <span>{filtered.length.toLocaleString()} registro{filtered.length !== 1 ? 's' : ''}{hayFiltros ? ' filtrados' : ' totales'}</span>
        <span style={{ fontSize: 11, opacity: 0.6 }}>{viewMode === 'table' ? 'Clic en encabezado para ordenar · ' : ''}</span>
      </div>
    </>
  )
}
