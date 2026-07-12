"use client"

import { useEffect, useRef } from "react"
import confetti from "canvas-confetti"

const COLORS = ["#818cf8", "#c084fc", "#f472b6", "#34d399", "#fbbf24", "#f87171", "#22d3ee", "#f97316"]

export function Confetti() {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    // Big central burst
    confetti({
      particleCount: 300,
      spread: 160,
      startVelocity: 40,
      gravity: 0.8,
      ticks: 500,
      origin: { x: 0.5, y: 0.35 },
      colors: COLORS,
      disableForReducedMotion: true,
    })

    // Extra burst slightly offset
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 120,
        startVelocity: 30,
        gravity: 1.0,
        ticks: 400,
        origin: { x: 0.5, y: 0.5 },
        colors: COLORS,
      })
    }, 200)

    // Side bursts — more frequent and more particles
    const sideInterval = setInterval(() => {
      confetti({
        particleCount: 8,
        spread: 100,
        startVelocity: 25,
        gravity: 0.9,
        ticks: 350,
        origin: { x: -0.1, y: Math.random() * 0.8 },
        colors: COLORS,
      })
      confetti({
        particleCount: 8,
        spread: 100,
        startVelocity: 25,
        gravity: 0.9,
        ticks: 350,
        origin: { x: 1.1, y: Math.random() * 0.8 },
        colors: COLORS,
      })
    }, 30)

    setTimeout(() => clearInterval(sideInterval), 3000)

    return () => clearInterval(sideInterval)
  }, [])

  return null
}
