"use client"

import { useEffect, useRef } from "react"
import { motion, useAnimation } from "framer-motion"

const COLORS = ["#818cf8", "#c084fc", "#f472b6", "#34d399", "#fbbf24", "#f87171", "#22d3ee"]
const COUNT = 60

function randomIn(min: number, max: number) {
  return Math.random() * (max - min) + min
}

interface Particle {
  id: number
  x: number
  delay: number
  duration: number
  rotation: number
  color: string
  size: number
  drift: number
}

function generateParticles(): Particle[] {
  return Array.from({ length: COUNT }, (_, i) => ({
    id: i,
    x: randomIn(0, 100),
    delay: randomIn(0, 0.8),
    duration: randomIn(1.2, 2.8),
    rotation: randomIn(-360, 360),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: randomIn(4, 10),
    drift: randomIn(-30, 30),
  }))
}

export function Confetti() {
  const particles = useRef(generateParticles()).current

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: -10,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            borderRadius: 1,
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: ["0vh", "100vh"],
            rotate: [0, p.rotation * 2, p.rotation],
            opacity: [1, 1, 0],
            x: [0, p.drift, p.drift * 1.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
            repeat: 0,
          }}
        />
      ))}
    </div>
  )
}
