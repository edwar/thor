"use client"

import { useEffect, useRef } from "react"
import confetti from "canvas-confetti"

const COLORS = ["#44acd4", "#1a7a9e", "#f472b6", "#34d399", "#fbbf24", "#f87171", "#22d3ee", "#f97316"]

function randomIn(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export function Confetti() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const duration = 8 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    // Find the relative container position to center the card explosion
    const container = containerRef.current?.parentElement
    if (!container) return

    // 1. Fireworks effect loop
    const interval = setInterval(function () {
      let timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      // Since particles fall down, start them slightly higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomIn(0.1, 0.3), y: Math.random() - 0.2 } })
      confetti({ ...defaults, particleCount, origin: { x: randomIn(0.7, 0.9), y: Math.random() - 0.2 } })
    }, 250)

    // 2. Side ráfagas - continuous stream of confetti from the screen edges (left and right) using requestAnimationFrame
    let frameId: number

    function cannons() {
      // Left screen edge shooting diagonally right-up with randomized values
      confetti({
        particleCount: 2,
        angle: randomIn(55, 65),
        spread: randomIn(45, 65),
        origin: { x: 0 },
        colors: COLORS
      })

      // Right screen edge shooting diagonally left-up with randomized values
      confetti({
        particleCount: 2,
        angle: randomIn(115, 125),
        spread: randomIn(45, 65),
        origin: { x: 1 },
        colors: COLORS
      })

      if (Date.now() < animationEnd) {
        frameId = requestAnimationFrame(cannons) // Recursively schedule the next frame
      }
    }

    // Start the animation loop
    cannons()

    return () => {
      clearInterval(interval) // Stop fireworks interval
      if (frameId) {
        cancelAnimationFrame(frameId) // Stop side cannons animation frame
      }
    }
  }, [])

  return <div ref={containerRef} className="absolute inset-0 pointer-events-none" />
}
