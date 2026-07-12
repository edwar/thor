"use client"

import { useRef } from "react"
import { motion } from "framer-motion"

const COLORS = ["#818cf8", "#c084fc", "#f472b6", "#34d399", "#fbbf24", "#f87171", "#22d3ee", "#f97316"]
const COUNT = 120

export function Confetti() {
  const particles = useRef(
    Array.from({ length: COUNT }, (_, i) => {
      const angle = Math.random() * Math.PI * 2
      const dist = 25 + Math.random() * 65
      return {
        id: i,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist + 15,
        delay: Math.random() * 0.15,
        rotation: Math.random() * 1080 - 540,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        w: 5 + Math.random() * 7,
        h: 3 + Math.random() * 5,
        radius: Math.random() > 0.5 ? "50%" : "1px",
      }
    }),
  ).current

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
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
            borderRadius: p.radius,
            x: "-50%",
            y: "-50%",
          }}
          initial={{ x: "-50%", y: "-50%", rotate: 0, opacity: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: ["-50%", `calc(-50% + ${p.dx}vw)`, `calc(-50% + ${p.dx * 1.1}vw)`],
            y: ["-50%", `calc(-50% + ${p.dy}vh)`, `calc(-50% + ${p.dy * 1.3}vh)`],
            rotate: [0, p.rotation * 0.6, p.rotation],
          }}
          transition={{
            duration: 1.8 + Math.random() * 0.6,
            delay: p.delay,
            ease: [0.25, 0.1, 0.35, 1],
          }}
        />
      ))}
    </div>
  )
}
