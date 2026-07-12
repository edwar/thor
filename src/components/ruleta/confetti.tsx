"use client"

import { useEffect, useRef } from "react"
import confetti from "canvas-confetti"

const COLORS = ["#818cf8", "#c084fc", "#f472b6", "#34d399", "#fbbf24", "#f87171", "#22d3ee", "#f97316"]

export function Confetti() {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    // Initial burst
    confetti({
      particleCount: 120,
      spread: 140,
      startVelocity: 35,
      gravity: 1.0,
      ticks: 400,
      origin: { x: 0.5, y: 0.4 },
      colors: COLORS,
      disableForReducedMotion: true,
    })

    // Side bursts
    const sideInterval = setInterval(() => {
      confetti({
        particleCount: 3,
        spread: 80,
        startVelocity: 20,
        gravity: 1.0,
        ticks: 300,
        origin: { x: -0.1, y: Math.random() * 0.8 },
        colors: COLORS,
      })
      confetti({
        particleCount: 3,
        spread: 80,
        startVelocity: 20,
        gravity: 1.0,
        ticks: 300,
        origin: { x: 1.1, y: Math.random() * 0.8 },
        colors: COLORS,
      })
    }, 50)

    setTimeout(() => clearInterval(sideInterval), 2000)

    return () => clearInterval(sideInterval)
  }, [])

  return null
}
