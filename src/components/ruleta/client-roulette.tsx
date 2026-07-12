"use client"

import dynamic from "next/dynamic"

const Wheel = dynamic(
  () => import("@/components/ruleta/roulette-wheel").then((m) => m.RouletteWheel),
  { ssr: false },
)

export { Wheel as ClientRouletteWheel }