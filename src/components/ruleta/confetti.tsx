"use client"

import { useEffect, useRef } from "react"
import confetti from "canvas-confetti"

const COLORS = ["#818cf8", "#c084fc", "#f472b6", "#34d399", "#fbbf24", "#f87171", "#22d3ee", "#f97316"]

export function Confetti() {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    // Center burst
    confetti({
      particleCount: 500, spread: 160, startVelocity: 40, gravity: 0.7, scalar: 1.3,
      ticks: 500, origin: { x: 0.5, y: 0.3 }, colors: COLORS, disableForReducedMotion: true,
    })

    // Side ráfagas — shoot inward from just inside screen edges
    const cannons = setInterval(() => {
      confetti({
        particleCount: 30, angle: 65, spread: 80, startVelocity: 35, gravity: 0.6,
        scalar: 1.6, drift: 0.8, ticks: 600,
        origin: { x: 0.05, y: Math.random() * 0.4 + 0.3 },
        colors: ["#34d399", "#22d3ee", "#818cf8", "#c084fc"],
      })
      confetti({
        particleCount: 30, angle: 115, spread: 80, startVelocity: 35, gravity: 0.6,
        scalar: 1.6, drift: -0.8, ticks: 600,
        origin: { x: 0.95, y: Math.random() * 0.4 + 0.3 },
        colors: ["#f472b6", "#fbbf24", "#f87171", "#f97316"],
      })
    }, 60)

    setTimeout(() => clearInterval(cannons), 3000)

    return () => clearInterval(cannons)
  }, [])

  return null
}
