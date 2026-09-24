import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { MESES, MESES_FULL } from '../../utils/productividadConstants'
import { calcPct, colorPct, noHabiaIngresado } from '../../utils/productividadHelpers'

const ceros = () => Array(MESES.length).fill(0)
const suma = (arr) => arr.reduce((s, v) => s + (Number(v) || 0), 0)

export default function PersonaModal({ inicial, cfg, persona, onGuardar, onCerrar, guardando, errorGuardado }) {
  const [form, setForm] = useState(inicial)

  const totalResueltos = suma(form.resueltos)
  const totalAsignados = suma(form.asignados)
  const pctTotal = calcPct(totalResueltos, totalAsignados)

  const setCampo = (campo, valor) => setForm(f => ({ ...f, [campo]: valor }))
  const setMes = (campo, idx, valor) => setForm(f => {
    const arr = [...f[campo]]
    arr[idx] = valor
    return { ...f, [campo]: arr }
  })
  // Al cambiar de año, cargar los valores ya guardados de ese año (o ceros si es nuevo)
  const setAnio = (valor) => setForm(f => {
    const anio = Number(valor)
    const resueltos = persona?.resueltosPorAnio?.[anio]
    const asignados = persona?.asignadosPorAnio?.[anio]
    return {
      ...f,
      anio: valor,
      resueltos: resueltos ? [...resueltos] : ceros(),
      asignados: asignados ? [...asignados] : ceros(),
    }
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

          {cfg.usaClientes ? (
            <>
              <div className="pr-field">
                <span className="pr-field-label">Clientes por mes — {form.anio}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  El % de resolución se calcula solo: clientes resueltos ÷ clientes asignados.
                </span>
              </div>
              <table className="pr-mes-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Mes</th>
                    <th>Clientes asignados</th>
                    <th>Clientes resueltos</th>
                    <th>% Resolución</th>
                  </tr>
                </thead>
                <tbody>
                  {MESES.map((m, i) => {
                    const asig = Number(form.asignados[i]) || 0
                    const resu = Number(form.resueltos[i]) || 0
                    const pct = calcPct(resu, asig)
                    const sinIngreso = noHabiaIngresado(form, MESES_FULL[i], Number(form.anio))
                    return (
                      <tr key={m} style={sinIngreso ? { opacity: .55 } : undefined}>
                        <td title={sinIngreso ? 'Aún no había ingresado' : undefined}>{m}</td>
                        <td>
                          <input
                            className="pr-input"
                            type="number" min="0" step="1"
                            value={form.asignados[i]}
                            onChange={e => setMes('asignados', i, e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            className="pr-input"
                            type="number" min="0" step="1"
                            value={form.resueltos[i]}
                            onChange={e => setMes('resueltos', i, e.target.value)}
                          />
                        </td>
                        <td>
                          {asig > 0
                            ? <b style={{ color: colorPct(pct) }}>{pct}%</b>
                            : <span className="pr-month-pct--empty">—</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              <div className="pr-modal-totals">
                <div className="pr-modal-total-box"><span>Asignados {form.anio}</span><b>{totalAsignados.toLocaleString('es-CO')}</b></div>
                <div className="pr-modal-total-box"><span>Resueltos {form.anio}</span><b>{totalResueltos.toLocaleString('es-CO')}</b></div>
                <div className="pr-modal-total-box">
                  <span>% Resolución</span>
                  <b style={{ color: totalAsignados > 0 ? colorPct(pctTotal) : undefined }}>{pctTotal}%</b>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="pr-field">
                <span className="pr-field-label">Ventas por mes — {form.anio} (Ene — Dic)</span>
                <div className="pr-months-grid">
                  {MESES.map((m, i) => (
                    <div className="pr-month-field" key={m}>
                      <label>{m}</label>
                      <input
                        className="pr-input"
                        type="number"
                        min="0"
                        value={form.resueltos[i]}
                        onChange={e => setMes('resueltos', i, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pr-modal-total">
                <span>Total de {form.anio}</span>
                <b>{totalResueltos}</b>
              </div>
            </>
          )}
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
