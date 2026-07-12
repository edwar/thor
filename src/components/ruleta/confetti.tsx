"use client"

import { useEffect, useRef, useMemo } from "react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"

const COLORS = ["#818cf8", "#c084fc", "#f472b6", "#34d399", "#fbbf24", "#f87171", "#22d3ee", "#f97316"]

export function Confetti() {
  const fired = useRef(false)

  const groundPieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: 1.5 + Math.random() * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        w: 5 + Math.random() * 7,
        h: 3 + Math.random() * 4,
        rotate: Math.random() * 360,
      })),
    [],
  )

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    const colors = COLORS

    // Initial burst
    confetti({
      particleCount: 120,
      spread: 140,
      startVelocity: 35,
      gravity: 1.0,
      ticks: 400,
      origin: { x: 0.5, y: 0.4 },
      colors,
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
        colors,
      })
      confetti({
        particleCount: 3,
        spread: 80,
        startVelocity: 20,
        gravity: 1.0,
        ticks: 300,
        origin: { x: 1.1, y: Math.random() * 0.8 },
        colors,
      })
    }, 50)

    setTimeout(() => clearInterval(sideInterval), 2000)

    return () => clearInterval(sideInterval)
  }, [])

  return (
    <>
      {groundPieces.map((p) => (
        <motion.div
          key={p.id}
          className="pointer-events-none fixed z-50 rounded-sm"
          style={{
            left: `${p.left}%`,
            bottom: 0,
            width: p.w,
            height: p.h,
            backgroundColor: p.color,
            rotate: `${p.rotate}deg`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ delay: p.delay, duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </>
  )
}
