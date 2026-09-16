import { useState, useEffect, useRef } from 'react'

// ── Transición suave entre vistas (fade out → fade in al cambiar filtros) ──
export default function FadeSwitch({ fadeKey, children }) {
  const [visible, setVisible] = useState(true)
  const [snapshot, setSnapshot] = useState(children)
  const prevKey = useRef(fadeKey)

  useEffect(() => {
    if (prevKey.current !== fadeKey) {
      setVisible(false)
      const t = setTimeout(() => {
        setSnapshot(children)
        prevKey.current = fadeKey
        setVisible(true)
      }, 160)
      return () => clearTimeout(t)
    }
    setSnapshot(children)
  }, [fadeKey, children])

  return (
    <div className="db-fade-switch" style={{ opacity: visible ? 1 : 0 }}>
      {snapshot}
    </div>
  )
}
