import { useState, useEffect, useRef } from 'react'

// Cuenta ascendente/descendente con easing hacia un valor objetivo.
export function useCountUp(value, duration = 650) {
  const numeric = typeof value === 'number' && !isNaN(value) ? value : 0
  const [display, setDisplay] = useState(numeric)
  const fromRef = useRef(numeric)
  const rafRef = useRef(null)

  useEffect(() => {
    const from = fromRef.current
    const to = numeric
    if (from === to) { setDisplay(to); return }
    const start = performance.now()
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setDisplay(from + (to - from) * eased)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        fromRef.current = to
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => rafRef.current && cancelAnimationFrame(rafRef.current)
  }, [numeric, duration])

  return display
}
