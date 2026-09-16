import { X } from 'lucide-react'
import AnimatedModal from '../ui/AnimatedModal'
import { PILL_BASE, PILL_STYLES } from './pillsConstants'

export default function ImportPreviewModal({ importPreview, importConfirming, onCancel, onConfirm }) {
  return (
    <AnimatedModal open={!!importPreview} onRequestClose={() => !importConfirming && onCancel()} maxWidth={980}>
      {importPreview && (() => {
        const validas = importPreview.filter(f => !f.omitir)
        const omitidas = importPreview.filter(f => f.omitir)
        const conAdvertencia = validas.filter(f => f.advertencias.length > 0)
        return (
          <>
            <div className="modal-header">
              <div>
                <h2>Vista previa de la importación</h2>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {importPreview.length} fila{importPreview.length !== 1 ? 's' : ''} leída{importPreview.length !== 1 ? 's' : ''} del archivo — nada se ha guardado todavía.
                </div>
              </div>
              <button className="modal-close" onClick={onCancel} disabled={importConfirming}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '62vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                <span style={{ ...PILL_BASE, background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC' }}>
                  ✓ {validas.length} listas para importar
                </span>
                {conAdvertencia.length > 0 && (
                  <span style={{ ...PILL_BASE, background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' }}>
                    ⚠ {conAdvertencia.length} con advertencia (se importan igual)
                  </span>
                )}
                {omitidas.length > 0 && (
                  <span style={{ ...PILL_BASE, background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' }}>
                    ✕ {omitidas.length} se van a omitir
                  </span>
                )}
              </div>

              <table style={{ width: '100%', fontSize: 12.5, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '6px 8px' }}>#</th>
                    <th style={{ padding: '6px 8px' }}>Nombre</th>
                    <th style={{ padding: '6px 8px' }}>Concepto</th>
                    <th style={{ padding: '6px 8px' }}>F. inicio</th>
                    <th style={{ padding: '6px 8px' }}>F. fin</th>
                    <th style={{ padding: '6px 8px' }}>Días</th>
                    <th style={{ padding: '6px 8px' }}>Dependencia</th>
                    <th style={{ padding: '6px 8px' }}>Observación</th>
                    <th style={{ padding: '6px 8px' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.map((fila, i) => {
                    if (fila.omitir) {
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid var(--bg)', opacity: 0.55 }}>
                          <td style={{ padding: '6px 8px' }}>{i + 1}</td>
                          <td style={{ padding: '6px 8px' }} colSpan={7}>
                            {(fila.filaOriginal || []).slice(0, 2).filter(Boolean).join(' — ') || '(fila vacía)'}
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <span style={PILL_STYLES.no}>Omitida — {fila.motivoOmision}</span>
                          </td>
                        </tr>
                      )
                    }
                    const p = fila.payload
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--bg)' }}>
                        <td style={{ padding: '6px 8px', color: 'var(--text-muted)' }}>{i + 1}</td>
                        <td style={{ padding: '6px 8px', fontWeight: 600 }}>{p.nombre_empleado}</td>
                        <td style={{ padding: '6px 8px' }}>
                          {p.concepto}
                          {p.jornada === 'Medio día' && <span style={{ color: 'var(--text-muted)' }}> (½ día)</span>}
                          {fila.conceptoOriginal && fila.conceptoOriginal.toLowerCase().trim() !== p.concepto.toLowerCase().trim() && (
                            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', fontStyle: 'italic' }}>original: "{fila.conceptoOriginal}"</div>
                          )}
                        </td>
                        <td style={{ padding: '6px 8px' }}>{p.fecha_inicio || '—'}</td>
                        <td style={{ padding: '6px 8px' }}>{p.fecha_fin || '—'}</td>
                        <td style={{ padding: '6px 8px' }}>{p.total_dias ?? '—'}</td>
                        <td style={{ padding: '6px 8px' }}>{p.dependencia || '—'}</td>
                        <td style={{ padding: '6px 8px', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.observacion || ''}>
                          {p.observacion || '—'}
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          {fila.advertencias.length > 0
                            ? <span style={PILL_STYLES.validar} title={fila.advertencias.join(' · ')}>⚠ {fila.advertencias[0]}</span>
                            : <span style={PILL_STYLES.ok}>✓ OK</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={onCancel} disabled={importConfirming}>Cancelar</button>
              <button className="btn btn-primary" onClick={onConfirm} disabled={importConfirming || validas.length === 0}>
                {importConfirming ? 'Importando…' : `Confirmar e importar ${validas.length} registro${validas.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </>
        )
      })()}
    </AnimatedModal>
  )
}
