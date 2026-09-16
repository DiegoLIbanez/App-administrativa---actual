// =============================================================
// src/components/colaboradores/ColaboradorSkeleton.jsx
// -------------------------------------------------------------
// Skeleton de carga de la página Colaboradores.
// =============================================================
import './colaboradores.css'

export default function ColaboradorSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="col-skel" style={{ width: 42, height: 42, borderRadius: '50%' }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="col-skel" style={{ height: 13, width: '70%' }} />
              <div className="col-skel" style={{ height: 11, width: '40%' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {[1, 2, 3].map(j => <div key={j} className="col-skel" style={{ height: 48, borderRadius: 8 }} />)}
          </div>
          <div className="col-skel" style={{ height: 5, borderRadius: 999 }} />
        </div>
      ))}
    </div>
  )
}