import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { CICLOS, statusPill, camposFaltantes } from './pillsConstants'

// ── Pill editable (clic cicla entre opciones) ───────────────────────────────
export function EditablePill({ field, value, rowId, onSave }) {
  const [saving, setSaving] = useState(false)
  const opciones = CICLOS[field] || []
  const handleClick = async () => {
    if (saving) return
    const idx = opciones.indexOf(value || '')
    const next = opciones[(idx + 1) % opciones.length]
    setSaving(true)
    await onSave(rowId, field, next)
    setSaving(false)
  }
  return (
    <span
      onClick={handleClick}
      title="Clic para cambiar"
      style={{ cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.6 : 1, display: 'inline-flex' }}
    >
      {statusPill(value)}
    </span>
  )
}

// ── Icono de orden ──────────────────────────────────────────────────────────
export function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <ChevronUp size={11} style={{ opacity: 0.2, marginLeft: 2 }} />
  return sortDir === 'asc'
    ? <ChevronUp size={11} style={{ opacity: 1, color: 'var(--primary)', marginLeft: 2 }} />
    : <ChevronDown size={11} style={{ opacity: 1, color: 'var(--primary)', marginLeft: 2 }} />
}

// ── Indicador de campos faltantes ───────────────────────────────────────────
export function IncompleteIndicator({ row }) {
  const campos = camposFaltantes(row)
  if (!campos.length) return null
  return (
    <span
      title={campos.join('\n')}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 16, height: 16, borderRadius: '50%', background: '#FEF3C7',
        color: '#92400E', fontSize: 10, fontWeight: 800, cursor: 'default',
        border: '1px solid #FCD34D', marginLeft: 4, flexShrink: 0,
      }}
    >!</span>
  )
}