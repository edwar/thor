"use client"

import { useEffect, useRef } from "react"
import confetti from "canvas-confetti"

const COLORS = ["#818cf8", "#c084fc", "#f472b6", "#34d399", "#fbbf24", "#f87171", "#22d3ee", "#f97316"]

export function Confetti() {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    var duration = 15 * 1000
    var animationEnd = Date.now() + duration
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0, colors: COLORS }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    var interval = setInterval(function () {
      var timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      var particleCount = 50 * (timeLeft / duration)
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  return null
}
