import { X, Calendar, Clock, AlertCircle } from 'lucide-react'
import { useCompany } from '../../context/CompanyContext'
import { diasHabilesEntre } from '../../utils/diasHabiles'
import { calcAntiguedad } from '../../utils/vacacionesHelpers'
import { ESTADOS, ESTADO_STYLES, DEPENDENCIAS } from '../../utils/vacacionesConstants'
import SearchableSelect from '../ui/SearchableSelect'

const GRAD = {
  'Vacaciones':             'linear-gradient(135deg,#0F6E56 0%,#10B981 100%)',
  'Vacaciones en dinero':   'linear-gradient(135deg,#78350F 0%,#D97706 100%)',
  'Vacaciones compensadas': 'linear-gradient(135deg,#1E3A5F 0%,#2563EB 100%)',
}
const ICON = {
  'Vacaciones': '🌴', 'Vacaciones en dinero': '💰', 'Vacaciones compensadas': '📋',
}
const TIPO_COLS = { 'Vacaciones': '#0F6E56', 'Vacaciones en dinero': 'var(--warning-text)', 'Vacaciones compensadas': 'var(--info-text)' }
const TIPO_BGS = { 'Vacaciones': 'var(--success-bg)', 'Vacaciones en dinero': 'var(--warning-bg)', 'Vacaciones compensadas': 'var(--info-bg)' }

export default function ModalForm({
  modal, form, setForm, f, save, saving,
  empActivos, empInactivos, diasAcumuladosForm, anioActual,
  onClose,
}) {
  const { departamentos } = useCompany()
  const listaDepartamentos = departamentos && departamentos.length > 0 ? departamentos : DEPENDENCIAS
  const tipo = form.tipo_vacacion || 'Vacaciones'
  const EST = form.estado || 'Pendiente'
  const estStyle = ESTADO_STYLES[EST] || ESTADO_STYLES['Pendiente']
  const campos = [form.nombre_empleado, form.tipo_vacacion, form.estado]
  const pct = Math.round((campos.filter(Boolean).length / campos.length) * 100)

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}
      style={{ animation: 'fadeIn .2s ease' }}>
      <div className="modal" style={{ maxWidth: 600, padding: 0, overflow: 'hidden', borderRadius: 16, animation: 'fadeInUp .25s ease' }}>

        {/* ── Cabecera dinámica por tipo ── */}
        <div style={{ background: GRAD[tipo] || GRAD['Vacaciones'], padding: '22px 24px 16px', transition: 'background .4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            {/* Ícono */}
            <div style={{
              width: 58, height: 58, borderRadius: 14, flexShrink: 0, fontSize: 30,
              background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.18)', transition: 'all .3s ease',
            }}>{ICON[tipo] || '🌴'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>
                {modal === 'add' ? 'Nueva solicitud · Vacaciones' : 'Editando solicitud'}
              </div>
              <h2 style={{ color: '#fff', margin: '0 0 5px', fontSize: 17, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {form.nombre_empleado || 'Selecciona un empleado'}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
                  {tipo}
                </span>
                <span style={{ ...estStyle, padding: '2px 9px', fontSize: 11, borderRadius: 999 }}>
                  {EST}
                </span>
                {form.fecha_inicio && form.fecha_fin && (
                  <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
                    📅 {form.fecha_inicio} → {form.fecha_fin}
                  </span>
                )}
                {form.total_dias && (
                  <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>⏱ {form.total_dias}d</span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="modal-close-btn"
              style={{
                border: 'none', borderRadius: 10,
                color: '#fff', cursor: 'pointer', padding: '8px 10px', display: 'flex',
                alignItems: 'center', flexShrink: 0, transition: 'background .15s'
              }}>
              <X size={16} />
            </button>
          </div>
          {/* Barra progreso */}
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>COMPLETADO</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: 700 }}>{pct}%</span>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 99 }}>
              <div style={{ height: '100%', borderRadius: 99, background: 'rgba(255,255,255,0.85)', width: `${pct}%`, transition: 'width .3s ease' }} />
            </div>
          </div>
        </div>

        {/* ── Cuerpo ── */}
        <div className="modal-body" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20, maxHeight: '62vh', overflowY: 'auto' }}>

          {/* S1: Empleado */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>👤</div>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#374151' }}>Empleado *</span>
            </div>
            <SearchableSelect
              value={form.nombre_empleado}
              onChange={val => setForm(p => ({ ...p, nombre_empleado: val }))}
              activos={empActivos} inactivos={empInactivos}
              placeholder="— Seleccionar empleado —"
            />
            {form.nombre_empleado?.trim() && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE', borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
                  <Calendar size={11} /> Días hábiles {anioActual}: {diasAcumuladosForm}
                </span>
                {form.fecha_ingreso && calcAntiguedad(form.fecha_ingreso) && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--info-bg)', color: 'var(--info-text)', border: '1px solid color-mix(in srgb, var(--info) 30%, transparent)', borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
                    <Clock size={11} /> Antigüedad: {calcAntiguedad(form.fecha_ingreso)}
                  </span>
                )}
              </div>
            )}
          </div>

          <div style={{ height: 1, background: 'var(--border)' }} />

          {/* S2: Tipo, Estado, Área, Período */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: '#FEF9C3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>📋</div>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#374151' }}>Tipo y estado</span>
            </div>

            {/* Tipo: tarjetas */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Tipo de vacación</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { val: 'Vacaciones', icon: '🌴', desc: 'Disfrute de días' },
                  { val: 'Vacaciones en dinero', icon: '💰', desc: '15 días en dinero' },
                  { val: 'Vacaciones compensadas', icon: '📋', desc: 'Compensación' },
                ].map(opt => {
                  const sel = (form.tipo_vacacion || 'Vacaciones') === opt.val
                  const col = TIPO_COLS[opt.val], bg = TIPO_BGS[opt.val]
                  return (
                    <button key={opt.val} type="button"
                      onClick={() => setForm(p => ({ ...p, tipo_vacacion: opt.val }))}
                      style={{
                        padding: '12px 10px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                        border: sel ? `2px solid ${col}` : '2px solid var(--border)',
                        background: sel ? bg : 'var(--surface)',
                        transition: 'all .2s',
                        boxShadow: sel ? `0 0 0 3px color-mix(in srgb, ${col} 14%, transparent), 0 2px 8px color-mix(in srgb, ${col} 10%, transparent)` : '0 1px 2px rgba(0,0,0,.05)',
                        transform: sel ? 'translateY(-1px)' : 'none',
                      }}
                      onMouseEnter={e => { if (!sel) { e.currentTarget.style.borderColor = col; e.currentTarget.style.transform = 'translateY(-1px)' } }}
                      onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' } }}>
                      <div style={{ fontSize: 22, marginBottom: 4 }}>{opt.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: sel ? col : 'var(--text)', lineHeight: 1.3 }}>{opt.val}</div>
                      <div style={{ fontSize: 10, color: sel ? col : 'var(--text-muted)', marginTop: 2, opacity: .8 }}>{opt.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Estado: pills */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Estado</label>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {ESTADOS.map(s => {
                  const sel = (form.estado || 'Pendiente') === s
                  const st = ESTADO_STYLES[s]
                  return (
                    <button key={s} type="button"
                      onClick={() => setForm(p => ({ ...p, estado: s }))}
                      style={{
                        padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        border: sel ? `2px solid ${st.border}` : '1.5px solid var(--border)',
                        background: sel ? st.bg : 'var(--surface)',
                        color: sel ? st.color : 'var(--text-muted)',
                        transition: 'all .15s',
                        boxShadow: sel ? `0 0 0 2px ${st.border}` : 'none',
                      }}>
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>Área / Dependencia</label>
                <select className="form-control" value={form.dependencia || ''} onChange={f('dependencia')}>
                  <option value="">— Seleccionar —</option>
                  {listaDepartamentos.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>Período de vacaciones</label>
                <input className="form-control" value={form.periodo_vacaciones || ''} onChange={f('periodo_vacaciones')} placeholder="Ej: 2024-2025" />
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border)' }} />

          {/* S3: Fechas y días */}
          <div style={{ background: 'var(--bg,#F9FAFB)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>📅</div>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: (form.tipo_vacacion || 'Vacaciones') === 'Vacaciones en dinero' ? 'var(--text-muted)' : 'var(--text)' }}>
                Fechas y días {(form.tipo_vacacion || 'Vacaciones') === 'Vacaciones en dinero' && <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 10, marginLeft: 4 }}>— no aplica para vacaciones en dinero</span>}
              </span>
            </div>

            {(form.tipo_vacacion || 'Vacaciones') === 'Vacaciones en dinero' ? (
              <div style={{ background: 'var(--warning-bg)', border: '1px solid color-mix(in srgb, var(--warning) 40%, transparent)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--warning-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                No requiere fechas. Se asignan automáticamente <strong>15 días en dinero</strong>.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 90px', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>↘ Inicio</label>
                  <input className="form-control" type="date" value={form.fecha_inicio || ''} onChange={f('fecha_inicio')} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>↗ Fin</label>
                  <input className="form-control" type="date" value={form.fecha_fin || ''} onChange={f('fecha_fin')} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, display: 'block', whiteSpace: 'nowrap' }}>
                    Días {form.fecha_inicio && form.fecha_fin && <span style={{ color: 'var(--primary)' }}>●</span>}
                  </label>
                  <input className="form-control" type="number" min="0"
                    value={form.total_dias || ''} onChange={f('total_dias')}
                    placeholder="Auto"
                    style={form.fecha_inicio && form.fecha_fin ? { background: 'var(--bg)', color: 'var(--primary)', fontWeight: 800, textAlign: 'center' } : { textAlign: 'center' }} />
                </div>
              </div>
            )}

            {/* Días hábiles info */}
            {form.fecha_inicio && form.fecha_fin && (form.tipo_vacacion || 'Vacaciones') !== 'Vacaciones en dinero' && (
              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE', borderRadius: 999, padding: '3px 11px', fontSize: 12, fontWeight: 700 }}>
                  {diasHabilesEntre(form.fecha_inicio, form.fecha_fin)} días hábiles
                </span>
                {form.dias_en_dinero && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--warning-bg)', color: 'var(--warning-text)', border: '1px solid color-mix(in srgb, var(--warning) 40%, transparent)', borderRadius: 999, padding: '3px 11px', fontSize: 12, fontWeight: 700 }}>
                    💰 {form.dias_en_dinero} en dinero
                  </span>
                )}
              </div>
            )}
          </div>

          <div style={{ height: 1, background: 'var(--border)' }} />

          {/* S4: Datos adicionales */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: '#FEF9C3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>📊</div>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text)' }}>Datos adicionales</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>
                  Días en dinero
                  <span style={{ fontWeight: 400, fontSize: 10, marginLeft: 4, color: 'var(--text-muted)' }}>
                    {(form.tipo_vacacion || 'Vacaciones') === 'Vacaciones en dinero' ? '(fijo)' : '(15 − hábiles)'}
                  </span>
                </label>
                <input className="form-control" type="number" min="0"
                  value={form.dias_en_dinero || ''} onChange={f('dias_en_dinero')}
                  readOnly={(form.tipo_vacacion || 'Vacaciones') === 'Vacaciones en dinero'}
                  placeholder="Auto"
                  style={form.dias_en_dinero ? { background: '#FEF9C3', color: '#78350F', fontWeight: 700, textAlign: 'center' } : { fontWeight: 700, textAlign: 'center' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>Fecha de ingreso</label>
                <input className="form-control" type="date" value={form.fecha_ingreso || ''} onChange={f('fecha_ingreso')} />
                {form.fecha_ingreso && calcAntiguedad(form.fecha_ingreso) && (
                  <div style={{ fontSize: 10, color: '#7C3AED', marginTop: 4, fontWeight: 600 }}>
                    ⏱ {calcAntiguedad(form.fecha_ingreso)}
                  </div>
                )}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>Aprobado por</label>
                <input className="form-control" value={form.aprobado_por || ''} onChange={f('aprobado_por')} placeholder="Nombre del aprobador" />
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border)' }} />

          {/* S5: Observaciones */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>💬</div>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#374151' }}>Observaciones</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>Área contable</label>
                <textarea className="form-control" rows={2} value={form.observacion_contable || ''} onChange={f('observacion_contable')}
                  placeholder="Ej: 8 días compensados en dinero..." style={{ resize: 'vertical', lineHeight: 1.6 }} />
              </div>
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <div style={{
          borderTop: '1px solid var(--border)', padding: '14px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
          background: 'var(--surface)', borderRadius: '0 0 16px 16px'
        }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
            {[
              form.nombre_empleado && '👤 ' + form.nombre_empleado.split(' ')[0],
              form.tipo_vacacion && form.tipo_vacacion,
              form.estado && form.estado,
              form.total_dias && '⏱ ' + form.total_dias + 'd',
            ].filter(Boolean).join(' · ') || 'Completa los campos obligatorios *'}
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}
              style={{ minWidth: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {saving
                ? <><span>⏳</span> Guardando...</>
                : <><span>{modal === 'add' ? '🌴' : '💾'}</span> {modal === 'add' ? 'Crear solicitud' : 'Guardar cambios'}</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
