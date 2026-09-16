import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { MESES } from '../../utils/productividadConstants'

export default function PersonaModal({ inicial, cfg, persona, onGuardar, onCerrar, guardando, errorGuardado }) {
  const [form, setForm] = useState(inicial)
  const sufijo = cfg.esPorcentaje ? '%' : ''

  const totalPreview = form.meses.reduce((s, v) => s + (Number(v) || 0), 0)

  const setCampo = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }))
  const setMes = (idx, valor) => setForm(f => {
    const meses = [...f.meses]
    meses[idx] = valor
    return { ...f, meses }
  })
  // Al cambiar de año, cargar los valores ya guardados de ese año (o ceros si es nuevo)
  const setAnio = (valor) => setForm(f => {
    const anio = Number(valor)
    const mesesDelAnio = persona?.mesesPorAnio?.[anio]
    return { ...f, anio: valor, meses: mesesDelAnio ? [...mesesDelAnio] : Array(MESES.length).fill(0) }
  })

  return (
    <div className="pr-modal-overlay" onMouseDown={e => e.target === e.currentTarget && onCerrar()}>
      <div className="pr-modal">
        <div className="pr-modal-head">
          <span className="pr-modal-title">Editar a {inicial.nombre}</span>
          <button className="pr-modal-close" onClick={onCerrar}><X size={18} /></button>
        </div>
        <div className="pr-modal-body">
          {errorGuardado && <div className="pr-modal-error">{errorGuardado}</div>}

          <div className="pr-field">
            <span className="pr-field-label">Nombre completo</span>
            <input className="pr-input" value={form.nombre} disabled />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Se sincroniza automáticamente desde Empleados ({cfg.tabLabel}). Para cambiarlo, edítalo allá.
            </span>
          </div>

          <div className="pr-field-row">
            <div className="pr-field">
              <span className="pr-field-label">Cargo</span>
              <input
                className="pr-input"
                value={form.cargo}
                onChange={e => setCampo('cargo', e.target.value)}
                placeholder={`${cfg.tabLabel}, Supervisor...`}
              />
            </div>
            <div className="pr-field">
              <span className="pr-field-label">Fecha de ingreso</span>
              <input
                className="pr-input"
                type="date"
                value={form.ingreso}
                onChange={e => setCampo('ingreso', e.target.value)}
              />
            </div>
          </div>

          <div className="pr-field">
            <span className="pr-field-label">Año de los valores mensuales</span>
            <input
              className="pr-input"
              type="number"
              style={{ maxWidth: 140 }}
              value={form.anio}
              onChange={e => setAnio(e.target.value)}
            />
          </div>

          <div className="pr-field">
            <span className="pr-field-label">
              {cfg.esPorcentaje ? 'Producción por mes (%)' : 'Ventas por mes'} — {form.anio} (Ene — Dic)
            </span>
            <div className="pr-months-grid">
              {MESES.map((m, i) => (
                <div className="pr-month-field" key={m}>
                  <label>{m}</label>
                  <input
                    className="pr-input"
                    type="number"
                    min="0"
                    value={form.meses[i]}
                    onChange={e => setMes(i, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pr-modal-total">
            <span>Total de {form.anio}</span>
            <b>{totalPreview}{sufijo}</b>
          </div>
        </div>
        <div className="pr-modal-foot">
          <button className="pr-btn pr-btn--ghost" onClick={onCerrar} disabled={guardando}>Cancelar</button>
          <button
            className="pr-btn pr-btn--primary"
            disabled={guardando || !form.nombre.trim()}
            onClick={() => onGuardar(form)}
          >
            {guardando ? <Loader2 size={14} /> : null}
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
