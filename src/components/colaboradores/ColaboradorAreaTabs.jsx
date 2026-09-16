// =============================================================
// src/components/colaboradores/ColaboradorAreaTabs.jsx
// -------------------------------------------------------------
// Tabs por área de la página Colaboradores.
// =============================================================
import './colaboradores.css'

export default function ColaboradorAreaTabs({ colaboradores, areasDisponibles, filterArea, setFilterArea, setPage }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
      <button className={`col-tab ${filterArea === '' ? 'active' : ''}`} onClick={() => { setFilterArea(''); setPage(1) }}>
        Todas <span style={{ marginLeft: 4, background: filterArea === '' ? 'rgba(255,255,255,.3)' : 'var(--bg)', borderRadius: 999, padding: '1px 6px', fontSize: 11 }}>{colaboradores.length}</span>
      </button>
      {areasDisponibles.map(area => {
        const cnt = colaboradores.filter(c => c.area === area).length
        return (
          <button key={area} className={`col-tab ${filterArea === area ? 'active' : ''}`} onClick={() => { setFilterArea(filterArea === area ? '' : area); setPage(1) }}>
            {area} <span style={{ marginLeft: 4, background: filterArea === area ? 'rgba(255,255,255,.3)' : 'var(--bg)', borderRadius: 999, padding: '1px 6px', fontSize: 11 }}>{cnt}</span>
          </button>
        )
      })}
    </div>
  )
}