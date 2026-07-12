"use client"

import { useRef } from "react"
import { motion } from "framer-motion"

const COLORS = ["#818cf8", "#c084fc", "#f472b6", "#34d399", "#fbbf24", "#f87171", "#22d3ee", "#f97316"]
const COUNT = 100

const SHAPES = ["square", "circle", "line"] as const

export function Confetti() {
  const particles = useRef(
    Array.from({ length: COUNT }, (_, i) => {
      const angle = Math.random() * Math.PI * 2
      const velocity = 200 + Math.random() * 500
      const vy = Math.sin(angle) * velocity
      const vx = Math.cos(angle) * velocity
      return {
        id: i,
        vx,
        vy,
        delay: Math.random() * 0.3,
        rotation: Math.random() * 720 - 360,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        w: 4 + Math.random() * 8,
        h: 4 + Math.random() * 6,
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        gravity: 300 + Math.random() * 400,
      }
    }),
  ).current

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: "50%",
            top: "50%",
            width: p.w,
            height: p.h,
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "50%" : p.shape === "line" ? 0 : 1,
            x: "-50%",
            y: "-50%",
          }}
          initial={{ x: "-50%", y: "-50%", rotate: 0, opacity: 1 }}
          animate={{
            x: [`-50%`, `calc(-50% + ${p.vx * 0.6}px)`, `calc(-50% + ${p.vx * 1.5}px)`],
            y: [
              "-50%",
              `calc(-50% + ${p.vy * 0.6 - 0.5 * p.gravity * 0.3 * 0.3}px)`,
              `calc(-50% + ${p.vy * 1.5 - 0.5 * p.gravity * 1.5 * 1.5}px)`,
            ],
            rotate: [0, p.rotation * 2, p.rotation],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 1.5 + Math.random() * 0.5,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}
