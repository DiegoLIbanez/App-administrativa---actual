export default function ParqueaderoKPIs({
  rowsBase, carros, motos, exentos, total, sinReporte,
  mesBase, anioBase, mesActual, anioActual, filterTab,
  setFilterTab, setFilterTipo, setFilterMes, setFilterAnio, setPage,
}) {
  const kpis = [
    {
      label: 'Total registros', val: rowsBase.length, sub: `${mesBase} ${anioBase}`, icon: '🅿️', color: '#0F6E56', bg: '#E1F5EE',
      activo: filterTab === '',
      onClick: () => { setFilterTab(''); setFilterTipo(''); setPage(1) },
    },
    {
      label: 'Carros', val: carros, sub: `${((carros / total) * 100).toFixed(0)}% · ${mesBase} ${anioBase}`, icon: '🚗', color: '#1E40AF', bg: '#DBEAFE',
      activo: filterTab === 'CARRO',
      onClick: () => { setFilterTab('CARRO'); setFilterTipo(''); setPage(1) },
    },
    {
      label: 'Motos', val: motos, sub: `${((motos / total) * 100).toFixed(0)}% · ${mesBase} ${anioBase}`, icon: '🏍', color: '#92400E', bg: '#FEF3C7',
      activo: filterTab === 'MOTO',
      onClick: () => { setFilterTab('MOTO'); setFilterTipo(''); setPage(1) },
    },
    {
      label: 'Exentos de pago', val: exentos, sub: `${((exentos / total) * 100).toFixed(0)}% · ${mesBase} ${anioBase}`, icon: '✅', color: '#166534', bg: '#DCFCE7',
      activo: filterTab === 'exentos',
      onClick: () => { setFilterTab('exentos'); setFilterTipo(''); setPage(1) },
    },
    {
      label: 'Sin reporte', val: sinReporte, sub: `en ${mesActual}`, icon: '📤', color: sinReporte > 0 ? '#4338CA' : '#166534', bg: sinReporte > 0 ? '#EEF2FF' : '#F0FDF4',
      activo: filterTab === 'sin_rep',
      onClick: () => { setFilterTab('sin_rep'); setFilterMes(mesActual); setFilterAnio(anioActual); setPage(1) },
    },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 12, marginBottom: 16 }}>
      {kpis.map(k => (
        <div key={k.label} className="park-kpi" style={{
          background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '16px 18px',
          border: '1px solid var(--border)', cursor: 'pointer',
          transition: 'box-shadow .18s, transform .18s',
          outline: k.activo ? `2px solid ${k.color}` : 'none',
        }}
          onClick={k.onClick}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, background: k.bg, color: k.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 10,
          }}>{k.icon}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: k.color, lineHeight: 1, marginBottom: 4 }}>{k.val}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{k.label}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', opacity: .8, marginTop: 2 }}>{k.sub}</div>
        </div>
      ))}
    </div>
  )
}
