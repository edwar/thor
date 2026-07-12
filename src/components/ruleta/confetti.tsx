"use client"

import { useEffect, useRef } from "react"
import confetti from "canvas-confetti"

const COLORS = ["#818cf8", "#c084fc", "#f472b6", "#34d399", "#fbbf24", "#f87171", "#22d3ee", "#f97316"]

export function Confetti() {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    // === INITIAL BIG HIT ===

    // Center
    confetti({
      particleCount: 400, spread: 160, startVelocity: 40, gravity: 0.7, scalar: 1.3,
      ticks: 500, origin: { x: 0.5, y: 0.3 }, colors: COLORS, disableForReducedMotion: true,
    })

    // Left
    confetti({
      particleCount: 250, angle: 70, spread: 90, startVelocity: 35, gravity: 0.7, scalar: 1.3,
      ticks: 500, origin: { x: 0, y: 0.5 }, colors: COLORS, disableForReducedMotion: true,
    })

    // Right
    confetti({
      particleCount: 250, angle: 110, spread: 90, startVelocity: 35, gravity: 0.7, scalar: 1.3,
      ticks: 500, origin: { x: 1, y: 0.5 }, colors: COLORS, disableForReducedMotion: true,
    })

    // === FOLLOW-UP BURSTS ===
    setTimeout(() => {
      confetti({
        particleCount: 200, spread: 120, startVelocity: 25, gravity: 1.0, scalar: 1.2,
        ticks: 400, origin: { x: 0.5, y: 0.5 }, colors: COLORS,
      })
    }, 200)

    setTimeout(() => {
      confetti({
        particleCount: 150, spread: 100, startVelocity: 20, gravity: 1.2, scalar: 1.2,
        ticks: 350, origin: { x: 0.5, y: 0.6 }, colors: COLORS,
      })
    }, 500)

    // === SUSTAINED CANNONS (creates the "impactful" continuous effect) ===
    const cannons = setInterval(() => {
      confetti({
        particleCount: 15, angle: 75, spread: 60, startVelocity: 28, gravity: 0.8,
        scalar: 1.5, drift: 0.3, ticks: 500, origin: { x: 0, y: 0.4 + Math.random() * 0.3 },
        colors: ["#34d399", "#22d3ee", "#818cf8", "#c084fc"],
      })
      confetti({
        particleCount: 15, angle: 105, spread: 60, startVelocity: 28, gravity: 0.8,
        scalar: 1.5, drift: -0.3, ticks: 500, origin: { x: 1, y: 0.4 + Math.random() * 0.3 },
        colors: ["#f472b6", "#fbbf24", "#f87171", "#f97316"],
      })
      confetti({
        particleCount: 10, angle: 85, spread: 40, startVelocity: 22, gravity: 1.0,
        scalar: 1.4, ticks: 350, origin: { x: 0.5, y: 0.2 },
        colors: ["#fbbf24", "#f97316", "#f87171"],
      })
    }, 100)

    setTimeout(() => clearInterval(cannons), 3500)

    return () => clearInterval(cannons)
  }, [])

  return null
}
