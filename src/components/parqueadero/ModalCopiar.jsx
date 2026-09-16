import { X } from 'lucide-react'
import { TipoBadge } from './Badges'

export default function ModalCopiar({ modalCopiar, copiando, onClose, onConfirm }) {
  if (!modalCopiar) return null
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && !copiando && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>📋</div>
            <div>
              <h2 style={{ margin: 0, fontSize: 16 }}>Copiar al siguiente mes</h2>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{modalCopiar.mesOrigen} {modalCopiar.anioOrigen} → {modalCopiar.mesDestino} {modalCopiar.anioDestino}</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} disabled={copiando}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#166534', marginBottom: 6 }}>
              📋 {modalCopiar.registros.length} registro(s) se copiarán a <strong>{modalCopiar.mesDestino} {modalCopiar.anioDestino}</strong>
            </div>
            <div style={{ fontSize: 12, color: '#166534' }}>
              Se copian: nombre, placa, cédula, teléfono, tipo y observación.<br />
              Se limpian: fechas de ingreso/retiro y envío de reporte.
            </div>
          </div>
          {modalCopiar.yaExisten.length > 0 && (
            <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#92400E', marginBottom: 4 }}>
                ⚠ Ya existen {modalCopiar.yaExisten.length} registro(s) en {modalCopiar.mesDestino} {modalCopiar.anioDestino}
              </div>
              <div style={{ fontSize: 12, color: '#92400E' }}>Se agregarán los nuevos igualmente. Revisa después si hay duplicados.</div>
            </div>
          )}
          <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Empleado</th>
                  <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Placa</th>
                  <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Tipo</th>
                  <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)' }}>Obs.</th>
                </tr>
              </thead>
              <tbody>
                {modalCopiar.registros.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px 10px', fontWeight: 500, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nombre_empleado}</td>
                    <td style={{ padding: '6px 10px', fontFamily: 'monospace', fontWeight: 700 }}>{r.placa || '—'}</td>
                    <td style={{ padding: '6px 10px' }}>{r.tipo ? <TipoBadge tipo={r.tipo} /> : '—'}</td>
                    <td style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>{r.observacion || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={copiando}>Cancelar</button>
          <button className="btn" style={{ background: '#166534', color: '#fff' }} onClick={onConfirm} disabled={copiando}>
            {copiando ? '⏳ Copiando...' : `✅ Confirmar copia (${modalCopiar.registros.length})`}
          </button>
        </div>
      </div>
    </div>
  )
}
