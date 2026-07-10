"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calcTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export function Countdown({ targetDate }: { targetDate: string }) {
  const target = new Date(targetDate)
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    setMounted(true)
    setTimeLeft(calcTimeLeft(target))
    const timer = setInterval(() => setTimeLeft(calcTimeLeft(target)), 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  if (!mounted) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center"><span className="tabular-nums text-5xl font-bold tracking-tight sm:text-6xl">--</span><span className="mt-1 text-xs font-medium tracking-widest opacity-60">DÍAS</span></div>
        <span className="mb-6 text-3xl font-bold opacity-40">:</span>
        <div className="flex flex-col items-center"><span className="tabular-nums text-5xl font-bold tracking-tight sm:text-6xl">--</span><span className="mt-1 text-xs font-medium tracking-widest opacity-60">HORAS</span></div>
        <span className="mb-6 text-3xl font-bold opacity-40">:</span>
        <div className="flex flex-col items-center"><span className="tabular-nums text-5xl font-bold tracking-tight sm:text-6xl">--</span><span className="mt-1 text-xs font-medium tracking-widest opacity-60">MIN</span></div>
        <span className="mb-6 text-3xl font-bold opacity-40">:</span>
        <div className="flex flex-col items-center"><span className="tabular-nums text-5xl font-bold tracking-tight sm:text-6xl">--</span><span className="mt-1 text-xs font-medium tracking-widest opacity-60">SEG</span></div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <TimeBlock value={timeLeft.days} label="DÍAS" />
      <Separator />
      <TimeBlock value={timeLeft.hours} label="HORAS" />
      <Separator />
      <TimeBlock value={timeLeft.minutes} label="MIN" />
      <Separator />
      <TimeBlock value={timeLeft.seconds} label="SEG" />
    </div>
  )
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="tabular-nums text-5xl font-bold tracking-tight sm:text-6xl"
        >
          {String(value).padStart(2, "0")}
        </motion.span>
      </AnimatePresence>
      <span className="mt-1 text-xs font-medium tracking-widest opacity-60">
        {label}
      </span>
    </div>
  )
}

function Separator() {
  return (
    <span className="mb-6 text-3xl font-bold opacity-40">:</span>
  )
}
