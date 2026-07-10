"use client"

import { useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Participant {
  nombre: string
  puestos: number[]
}

interface Props {
  participants: Participant[]
  winnerIndex: number | null
  spinning: boolean
  onSpinEnd?: () => void
}

const ITEM_HEIGHT = 64
const VISIBLE_ITEMS = 7

export function RouletteWheel({ participants, winnerIndex, spinning, onSpinEnd }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  const duplicateParticipants = [
    ...participants,
    ...participants,
    ...participants,
  ]

  const centerIndex = winnerIndex !== null
    ? winnerIndex + participants.length
    : -1

  const targetY = centerIndex >= 0
    ? -(centerIndex * ITEM_HEIGHT - (VISIBLE_ITEMS * ITEM_HEIGHT) / 2 + ITEM_HEIGHT / 2)
    : 0

  const spinDistance = targetY - participants.length * ITEM_HEIGHT * 2

  return (
    <div className="relative mx-auto w-full max-w-md overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-zinc-950 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-zinc-950 to-transparent" />

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl border border-zinc-800"
        style={{ height: VISIBLE_ITEMS * ITEM_HEIGHT }}
      >
        <motion.div
          className="absolute inset-x-0"
          animate={
            spinning
              ? {
                  y: [0, spinDistance * 2.5, spinDistance * 1.2, spinDistance],
                }
              : { y: targetY }
          }
          transition={
            spinning
              ? {
                  duration: 4,
                  ease: [0.32, 0.72, 0, 1],
                  times: [0, 0.5, 0.75, 1],
                }
              : { duration: 0.5, ease: "easeOut" }
          }
          onAnimationComplete={() => {
            if (!spinning) onSpinEnd?.()
          }}
        >
          <AnimatePresence>
            {duplicateParticipants.map((p, i) => {
              const isSelected = winnerIndex !== null &&
                i === centerIndex

              return (
                <motion.div
                  key={`${p.nombre}-${i}`}
                  className={`flex items-center justify-between border-b border-zinc-800/50 px-6 transition-colors ${
                    isSelected && !spinning
                      ? "bg-thor-600/20 text-thor-300"
                      : "text-zinc-400"
                  }`}
                  style={{ height: ITEM_HEIGHT }}
                >
                  <span className="text-sm font-medium">
                    {p.nombre}
                  </span>
                  <span className="text-xs tabular-nums">
                    #{p.puestos.join(" · ")}
                  </span>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
