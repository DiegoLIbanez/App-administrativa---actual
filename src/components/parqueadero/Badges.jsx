export function TipoBadge({ tipo }) {
  const isCarro = tipo === 'CARRO'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
      background: isCarro ? '#DBEAFE' : '#FEF3C7', color: isCarro ? '#1E40AF' : '#92400E',
      border: isCarro ? '1px solid #93C5FD' : '1px solid #FCD34D',
    }}>{isCarro ? '🚗' : '🏍'} {tipo}</span>
  )
}

export function ObsBadge({ obs }) {
  if (!obs) return <span style={{ color: '#D1D5DB' }}>—</span>
  if (obs === 'EXENTOS DE PAGO') return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC' }}>✓ Exento</span>
  )
  return <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{obs}</span>
}
