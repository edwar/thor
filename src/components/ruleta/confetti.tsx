"use client"

import { useEffect, useRef } from "react"
import confetti from "canvas-confetti"

const COLORS = ["#818cf8", "#c084fc", "#f472b6", "#34d399", "#fbbf24", "#f87171", "#22d3ee", "#f97316"]

export function Confetti() {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    function burst(opts: Record<string, unknown>) {
      confetti({ colors: COLORS, disableForReducedMotion: true, ...opts })
    }

    // === INITIAL EXPLOSIONS ===

    // Central burst
    burst({ particleCount: 300, spread: 160, startVelocity: 40, gravity: 0.8, ticks: 500, origin: { x: 0.5, y: 0.35 } })

    // Bottom burst (shoots upward)
    burst({ particleCount: 200, spread: 140, startVelocity: 35, gravity: 0.6, ticks: 500, origin: { x: 0.5, y: 1 } })

    // === STAGGERED BURSTS ===
    setTimeout(() => burst({ particleCount: 200, spread: 120, startVelocity: 30, gravity: 1.0, ticks: 400, origin: { x: 0.5, y: 0.5 } }), 150)
    setTimeout(() => burst({ particleCount: 150, spread: 100, startVelocity: 25, gravity: 0.9, ticks: 350, origin: { x: 0.3, y: 0.4 } }), 300)
    setTimeout(() => burst({ particleCount: 150, spread: 100, startVelocity: 25, gravity: 0.9, ticks: 350, origin: { x: 0.7, y: 0.4 } }), 300)
    setTimeout(() => burst({ particleCount: 180, spread: 130, startVelocity: 28, gravity: 0.7, ticks: 450, origin: { x: 0.2, y: 0.6 } }), 500)
    setTimeout(() => burst({ particleCount: 180, spread: 130, startVelocity: 28, gravity: 0.7, ticks: 450, origin: { x: 0.8, y: 0.6 } }), 500)
    setTimeout(() => burst({ particleCount: 250, spread: 160, startVelocity: 35, gravity: 0.5, ticks: 500, origin: { x: 0.5, y: 0.2 } }), 700)

    // === CONTINUOUS CANNONS ===
    const cannons = setInterval(() => {
      // Left
      burst({ particleCount: 25, angle: 75, spread: 50, startVelocity: 35, gravity: 0.7, scalar: 1.5, drift: 0.5, ticks: 600, origin: { x: 0, y: 0.5 }, colors: ["#34d399", "#22d3ee", "#818cf8", "#c084fc"] })
      // Right
      burst({ particleCount: 25, angle: 105, spread: 50, startVelocity: 35, gravity: 0.7, scalar: 1.5, drift: -0.5, ticks: 600, origin: { x: 1, y: 0.5 }, colors: ["#f472b6", "#fbbf24", "#f87171", "#f97316"] })
      // Top-left
      burst({ particleCount: 15, angle: 45, spread: 40, startVelocity: 25, gravity: 0.9, scalar: 1.2, ticks: 400, origin: { x: 0, y: 0 }, colors: ["#fbbf24", "#f97316", "#f87171"] })
      // Top-right
      burst({ particleCount: 15, angle: 135, spread: 40, startVelocity: 25, gravity: 0.9, scalar: 1.2, ticks: 400, origin: { x: 1, y: 0 }, colors: ["#22d3ee", "#34d399", "#818cf8"] })
    }, 80)

    setTimeout(() => clearInterval(cannons), 4000)

    return () => clearInterval(cannons)
  }, [])

  return null
}
