import { X, Edit2 } from 'lucide-react'
import { TipoBadge, ObsBadge } from './Badges'

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{value || <span style={{ color: '#D1D5DB' }}>—</span>}</div>
    </div>
  )
}

export default function ModalDetalle({ row, onClose, onEdit }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: row.tipo === 'CARRO' ? '#DBEAFE' : '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>
              {row.tipo === 'CARRO' ? '🚗' : '🏍'}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 16 }}>{row.nombre_empleado}</h2>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.05em' }}>{row.placa}</span>
                · {row.mes} {row.anio}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px', marginBottom: 16 }}>
            <Field label="Nombre completo" value={row.nombre_empleado} />
            <Field label="Placa" value={<span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15 }}>{row.placa}</span>} />
            <Field label="Tipo de vehículo" value={<TipoBadge tipo={row.tipo} />} />
            <Field label="Mes / Año" value={[row.mes, row.anio].filter(Boolean).join(' ') || '—'} />
            <Field label="Cédula" value={row.cedula} />
            <Field label="Teléfono" value={row.telefono} />
            <Field label="Fecha de ingreso" value={row.fecha_ingreso} />
            <Field label="Fecha de retiro" value={row.fecha_retiro} />
            <Field label="Estado" value={row.retirado
              ? <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', lineHeight: 1 }}><span style={{ fontSize: 8 }}>●</span>Retirado</span>
              : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC' }}>✓ Activo</span>} />
            <div style={{ gridColumn: '1/-1' }}>
              <Field label="Observación" value={<ObsBadge obs={row.observacion} />} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <Field label="Observación del vehículo" value={row.nota_vehiculo} />
            </div>
          </div>
          {row.fecha_envio_reporte && (
            <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#3730A3', display: 'flex', alignItems: 'center', gap: 8 }}>
              📤 Reporte enviado el {row.fecha_envio_reporte.split('T')[0]}
            </div>
          )}
          {row.observacion === 'EXENTOS DE PAGO' && (
            <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#166534', display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              ✓ Este colaborador está exento de pago de parqueadero.
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cerrar</button>
          <button className="btn btn-primary" onClick={() => { onClose(); onEdit(row) }}><Edit2 size={14} /> Editar</button>
        </div>
      </div>
    </div>
  )
}
