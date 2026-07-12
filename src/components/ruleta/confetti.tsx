"use client"

import { useEffect, useRef } from "react"
import confetti from "canvas-confetti"

export function Confetti() {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    const duration = 2000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.6 },
        colors: ["#818cf8", "#c084fc", "#f472b6", "#34d399", "#fbbf24", "#f87171"],
      })
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.6 },
        colors: ["#818cf8", "#c084fc", "#f472b6", "#34d399", "#fbbf24", "#f87171"],
      })

      if (Date.now() < end) requestAnimationFrame(frame)
    }

    // Big central burst
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
      colors: ["#818cf8", "#c084fc", "#f472b6", "#34d399", "#fbbf24", "#f87171", "#22d3ee", "#f97316"],
      disableForReducedMotion: true,
    })

    frame()
  }, [])

  return null
}
