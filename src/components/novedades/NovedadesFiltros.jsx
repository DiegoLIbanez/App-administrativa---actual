import { Search, X, Calendar } from 'lucide-react'

// Barra de filtros de la página de Novedades. Vive aparte porque es un
// bloque grande y con mucha lógica de reset combinado (año limpia mes y
// periodo, etc.).
export default function NovedadesFiltros({
  searchInput, setSearchInput,
  filterConcepto, setFilterConcepto,
  filterDep, setFilterDep, depsEnDatos,
  filterDiagnostico, setFilterDiagnostico,
  filterAnio, setFilterAnio,
  filterMes, setFilterMes,
  periodos, filterPeriodo, setFilterPeriodo,
  soloActivas, setSoloActivas,
  rangoMes, hasFilter, clearFilters,
  conceptos, meses, aniosDisponibles, setPage,
}) {
  return (
    <div className="filters-row" style={{ flexWrap: 'wrap', gap: 8 }}>
      {/* Búsqueda */}
      <div style={{ position: 'relative', flex: '1 1 180px', minWidth: 160 }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="form-control search-input" style={{ paddingLeft: 32 }} placeholder="Buscar empleado, área..."
          value={searchInput} onChange={e => setSearchInput(e.target.value)} />
      </div>

      {/* Concepto */}
      <select className="form-control" style={{ flex: '1 1 140px', minWidth: 130 }} value={filterConcepto}
        onChange={e => { setFilterConcepto(e.target.value); setPage(1) }}>
        <option value="">Todos los conceptos</option>
        {conceptos.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      {/* Área / Dependencia */}
      <select className="form-control" style={{ flex: '1 1 140px', minWidth: 130 }} value={filterDep}
        onChange={e => { setFilterDep(e.target.value); setPage(1) }}>
        <option value="">Todas las áreas</option>
        {depsEnDatos.map(d => <option key={d} value={d}>{d}</option>)}
      </select>

      {/* Diagnóstico (código) */}
      <div style={{ position: 'relative', flex: '0 1 150px', minWidth: 130 }}>
        <input className="form-control" placeholder="Código diagnóstico..."
          value={filterDiagnostico} onChange={e => { setFilterDiagnostico(e.target.value); setPage(1) }} />
      </div>

      {/* Año */}
      <select className="form-control" style={{ flex: '0 0 100px' }} value={filterAnio}
        onChange={e => { setFilterAnio(e.target.value); setFilterMes(''); setFilterPeriodo(''); setPage(1) }}>
        <option value="">Año</option>
        {aniosDisponibles.map(a => <option key={a} value={a}>{a}</option>)}
      </select>

      {/* Mes */}
      <select className="form-control" style={{ flex: '0 0 130px' }} value={filterMes}
        onChange={e => { setFilterMes(e.target.value); setPage(1) }} disabled={!filterAnio}>
        <option value="">Mes</option>
        {meses.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
      </select>

      {/* Periodo */}
      {periodos.length > 0 && (
        <select className="form-control" style={{ flex: '0 0 130px' }} value={filterPeriodo}
          onChange={e => { setFilterPeriodo(e.target.value); setFilterAnio(''); setFilterMes(''); setPage(1) }}>
          <option value="">Periodo</option>
          {periodos.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      )}

      {/* Novedades activas o próximas (aún no vencidas) */}
      <button
        type="button"
        onClick={() => { setSoloActivas(v => !v); setPage(1) }}
        title="Mostrar novedades vigentes hoy y también las programadas a futuro (que aún no han vencido)"
        style={{
          display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 auto',
          padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
          cursor: 'pointer', whiteSpace: 'nowrap',
          background: soloActivas ? '#DCFCE7' : 'var(--surface)',
          color: soloActivas ? '#166534' : 'var(--text-muted)',
          border: soloActivas ? '1px solid #86EFAC' : '1px solid var(--border)',
        }}
      >
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: soloActivas ? '#22C55E' : 'var(--border)', flexShrink: 0,
        }} />
        ✅ Novedad activa
      </button>

      {/* Rango mes activo */}
      {rangoMes && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'var(--primary-light)', borderRadius: 8, fontSize: 12, color: 'var(--primary)', fontWeight: 600, flex: '0 0 auto' }}>
          <Calendar size={13} />
          {rangoMes.ini} → {rangoMes.fin}
          <span style={{ marginLeft: 4, color: 'var(--text-muted)', fontWeight: 400 }}>({rangoMes.lastDay}d)</span>
        </div>
      )}

      {hasFilter && (
        <button className="btn btn-ghost btn-sm" onClick={clearFilters}><X size={13} />Limpiar</button>
      )}
    </div>
  )
}