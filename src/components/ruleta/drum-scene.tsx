"use client"

import { useRef, useEffect, useMemo, useState, type MutableRefObject } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import gsap from "gsap"
import { createPanelTexture, type PanelData } from "./panel-texture"
import { playTick, playWin, playSpinStart } from "./spin-sound"
import type { Participant } from "./types"

const PANEL_W = 3.2
const PANEL_H = 0.55
const VISIBLE = 7
const ITEM_H = PANEL_H + 0.06
const CAM_DIST = 5.5

// Controls how aggressively panels shrink/fade toward the top & bottom edges.
// Higher = more dramatic wheel curve. ~0.6 gives ~30% height at the outermost slot.
const WHEEL_FACTOR = 0.62

export interface DrumSceneProps {
  participants: Participant[]
  winnerIndex: number | null
  spinning: boolean
  onSpinEnd?: () => void
  onAnimatingChange?: (v: boolean) => void
}

// ── Single panel ───────────────────────────────────────────
function Panel({
  data,
  yOffset,
  isWinner,
  isFinished,
  stripRef,
}: {
  data: PanelData
  yOffset: number
  isWinner: boolean
  isFinished: boolean
  stripRef: MutableRefObject<THREE.Group>
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null!)
  const normalData = useMemo(() => ({ ...data, isWinner: false }), [data])
  const texture = useMemo(() => createPanelTexture(normalData), [normalData])

  const showWinner = isWinner && isFinished

  useFrame(() => {
    if (!meshRef.current || !stripRef.current || !matRef.current) return

    // Distance of this panel from the visible center in world-space units
    const worldY = stripRef.current.position.y + yOffset

    // Wheel-viewed-from-front effect:
    //   cos(angle) collapses toward 0 as the panel moves away from center.
    //   This mimics the foreshortening of a cylinder seen head-on.
    const angle = Math.min(Math.abs(worldY) * WHEEL_FACTOR, Math.PI * 0.49)
    const cosA = Math.cos(angle)

    // Scale: full width, compressed height — no X-axis tilt at all
    const baseScale = showWinner ? 1.15 : 1
    meshRef.current.scale.set(baseScale, baseScale * Math.max(0.04, cosA), 1)
    meshRef.current.rotation.set(0, 0, 0) // always face the camera straight-on

    // Opacity fades toward edges just like a real wheel disappears into the side
    const baseOpacity = isFinished ? (isWinner ? 1 : 0.35) : 0.92
    matRef.current.opacity = baseOpacity * Math.max(0.05, cosA)
  })

  return (
    <group position={[0, yOffset, 0]}>
      <mesh ref={meshRef}>
        <planeGeometry args={[PANEL_W, PANEL_H]} />
        <meshPhysicalMaterial
          ref={matRef}
          map={texture}
          transparent
          opacity={0.92}
          roughness={0.25}
          metalness={0.65}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// ── Picker strip ──────────────────────────────────────────
function PickerStrip({
  participants,
  winnerIndex,
  spinning,
  onSpinEnd,
  onAnimatingChange,
}: DrumSceneProps) {
  const strip = useRef<THREE.Group>(null!)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [finished, setFinished] = useState(false)

  const COPIES = 7
  const totalItems = participants.length * COPIES
  const centerCopy = Math.floor(COPIES / 2) * participants.length

  const targetY =
    winnerIndex !== null
      ? -((centerCopy + winnerIndex) * ITEM_H)
      : 0

  const fullPass = participants.length * ITEM_H
  const initialY = winnerIndex !== null ? targetY - fullPass * 2 : 0

  const panelData = useMemo(() => {
    const arr: typeof participants = []
    for (let c = 0; c < COPIES; c++) arr.push(...participants)
    return arr.map((p, i) => ({
      data: {
        nombre: p.nombre,
        puestos: p.puestos,
        index: i,
        isWinner: false,
      } as PanelData,
      yOffset: i * ITEM_H,
    }))
  }, [participants, winnerIndex])

  // ── Auto-play animation on every mount ───────────────────
  useEffect(() => {
    if (winnerIndex === null || !strip.current) return

    const delay = setTimeout(() => {
      setFinished(false)
      onAnimatingChange?.(true)
      playSpinStart()

      const endY = targetY
      const scrollDist = Math.abs(initialY - endY)
      const itemsToShow = Math.round(scrollDist / ITEM_H)
      const speed = 3.3
      const duration = Math.max(60, itemsToShow / speed)

      let tickCount = 0
      tickRef.current = setInterval(() => {
        tickCount++
        if (tickCount % Math.max(1, Math.round(duration / 4)) === 0) playTick()
      }, 100)

      tl.current = gsap
        .timeline({
          onComplete: () => {
            setFinished(true)
            if (tickRef.current) clearInterval(tickRef.current)
            onAnimatingChange?.(false)
            onSpinEnd?.()
            playWin()
          },
        })
        .to(strip.current.position, {
          y: endY,
          duration,
          ease: "power1.out",
        })
        .to(
          strip.current.position,
          {
            y: endY,
            duration: 0.6,
            ease: "elastic.out(1, 0.35)",
            overwrite: true,
          },
          "-=0.25",
        )
    }, 400)

    return () => {
      clearTimeout(delay)
      tl.current?.kill()
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [])

  const isFinished = winnerIndex !== null && finished
  const winIdx = centerCopy + (winnerIndex ?? 0)

  return (
    <group ref={strip} position={[0, initialY, 0]}>
      {panelData.map(({ data, yOffset }) => (
        <Panel
          key={data.index}
          data={data}
          yOffset={yOffset}
          isWinner={winnerIndex !== null && data.index === winIdx}
          isFinished={isFinished}
          stripRef={strip}
        />
      ))}
    </group>
  )
}

// ── Lights ─────────────────────────────────────────────────
function Lights() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[0, 0, 6]} intensity={1.6} />
      <directionalLight position={[4, 2, 4]} intensity={0.6} />
      <pointLight position={[0, 0, 5]} intensity={0.5} color="#44acd4" />
    </>
  )
}

// ── Main export ────────────────────────────────────────────
export function DrumCanvas(props: DrumSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, CAM_DIST], fov: 32 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <Lights />
      <PickerStrip {...props} />
    </Canvas>
  )
}
