"use client"

import { useEffect, useRef } from "react"
import confetti from "canvas-confetti"

const COLORS = ["#818cf8", "#c084fc", "#f472b6", "#34d399", "#fbbf24", "#f87171", "#22d3ee", "#f97316"]

export function Confetti() {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    // Center — above the wheel
    confetti({
      particleCount: 250,
      spread: 140,
      startVelocity: 35,
      gravity: 0.9,
      ticks: 500,
      origin: { x: 0.5, y: 0.35 },
      colors: COLORS,
      disableForReducedMotion: true,
    })

    // Left side — shoots toward center
    confetti({
      particleCount: 180,
      angle: 75,
      spread: 80,
      startVelocity: 30,
      gravity: 0.8,
      ticks: 500,
      origin: { x: 0, y: 0.5 },
      colors: COLORS,
      disableForReducedMotion: true,
    })

    // Right side — shoots toward center
    confetti({
      particleCount: 180,
      angle: 105,
      spread: 80,
      startVelocity: 30,
      gravity: 0.8,
      ticks: 500,
      origin: { x: 1, y: 0.5 },
      colors: COLORS,
      disableForReducedMotion: true,
    })
  }, [])

  return null
}
