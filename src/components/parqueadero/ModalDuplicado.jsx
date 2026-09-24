import { X } from 'lucide-react'

export default function ModalDuplicado({ modalDuplicado, filterMes, filterAnio, onClose, onVerMesDestino }) {
  if (!modalDuplicado) return null
  return (
    <div className="modal-backdrop" onClick={onClose} style={{ animation: 'fadeIn .2s ease' }}>
      <div className="modal" style={{ maxWidth: 460, animation: 'fadeInUp .25s ease' }} onClick={e => e.stopPropagation()}>
        {/* Cabecera roja */}
        <div style={{
          background: 'linear-gradient(135deg,#7F1D1D 0%,#DC2626 100%)',
          borderRadius: '12px 12px 0 0', padding: '22px 24px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, flexShrink: 0,
          }}>🚫</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'color-mix(in srgb, var(--danger) 35%, transparent)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>
              Copia bloqueada
            </div>
            <h2 style={{ color: '#fff', margin: 0, fontSize: 17, fontWeight: 800 }}>
              Ya se realizó esta copia
            </h2>
          </div>
          <button onClick={onClose} className="modal-close-btn"
            style={{
              border: 'none', borderRadius: 8,
              color: '#fff', cursor: 'pointer', padding: '6px 8px', display: 'flex', alignItems: 'center',
              transition: 'background .15s'
            }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px 24px' }}>
          {/* Mensaje principal */}
          <div style={{
            background: 'var(--danger-bg)', border: '1px solid #FECACA', borderRadius: 10,
            padding: '14px 16px', marginBottom: 16,
          }}>
            <p style={{ margin: 0, fontSize: 13.5, color: '#7F1D1D', lineHeight: 1.6 }}>
              Los registros de <strong>{filterMes} {filterAnio}</strong> ya fueron copiados a{' '}
              <strong>{modalDuplicado.mesDestino} {modalDuplicado.anioDestino}</strong>.
              Se detectaron <strong>{modalDuplicado.placas.length} placa(s)</strong> que ya existen en ese mes.
            </p>
          </div>

          {/* Placas duplicadas */}
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
              Placas ya existentes en {modalDuplicado.mesDestino} {modalDuplicado.anioDestino}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 120, overflowY: 'auto' }}>
              {modalDuplicado.placas.map(p => (
                <span key={p} style={{
                  padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                  fontFamily: 'monospace', letterSpacing: '0.05em',
                  background: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid #FECACA',
                }}>{p}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            💡 Filtra <strong>{modalDuplicado.mesDestino} {modalDuplicado.anioDestino}</strong> para verificar los registros
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={onVerMesDestino}>Ver mes destino</button>
            <button className="btn" style={{ background: '#DC2626', color: '#fff' }} onClick={onClose}>
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
