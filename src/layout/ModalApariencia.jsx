import { useState } from 'react'
import { X, Check, Sun, Moon } from 'lucide-react'
import { TEMAS, obtenerTemaGuardado, aplicarTema, guardarTema, obtenerModoGuardado, aplicarModo, guardarModo } from '../utils/temas'

export default function ModalApariencia({ onClose }) {
  const [temaActivo, setTemaActivo] = useState(() => obtenerTemaGuardado().id)
  const [modoActivo, setModoActivo] = useState(() => obtenerModoGuardado())

  const elegir = (tema) => {
    aplicarTema(tema)
    guardarTema(tema.id)
    setTemaActivo(tema.id)
  }

  const elegirModo = (modo) => {
    aplicarModo(modo)
    guardarModo(modo)
    setModoActivo(modo)
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2>Apariencia</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 10, fontWeight: 600 }}>
            Modo
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
            {[
              { id: 'claro', nombre: 'Claro', Icono: Sun },
              { id: 'oscuro', nombre: 'Oscuro', Icono: Moon },
            ].map(({ id, nombre, Icono }) => (
              <button
                key={id}
                onClick={() => elegirModo(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px', borderRadius: 10,
                  border: modoActivo === id ? '2px solid var(--secondary)' : '1px solid var(--border)',
                  background: modoActivo === id ? 'var(--secondary-light)' : 'var(--surface)',
                  cursor: 'pointer', textAlign: 'left', color: 'var(--text)',
                }}
              >
                <Icono size={18} color={modoActivo === id ? 'var(--secondary-dark)' : 'var(--text-muted)'} />
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{nombre}</span>
                {modoActivo === id && <Check size={16} color="var(--secondary-dark)" />}
              </button>
            ))}
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
            Elige el color de acento de la aplicación (botones, estados activos, gráficas).
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {TEMAS.map(tema => (
              <button
                key={tema.id}
                onClick={() => elegir(tema)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px', borderRadius: 10,
                  border: temaActivo === tema.id ? '2px solid var(--secondary)' : '1px solid var(--border)',
                  background: temaActivo === tema.id ? 'var(--secondary-light)' : 'var(--surface)',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  background: tema.swatch, border: '2px solid #fff',
                  boxShadow: '0 0 0 1px var(--border)',
                }} />
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>
                  {tema.nombre}
                </span>
                {temaActivo === tema.id && <Check size={16} color="var(--secondary-dark)" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
