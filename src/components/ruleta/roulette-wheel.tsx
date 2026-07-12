"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import gsap from "gsap"
import { playTick, playWin, playSpinStart } from "./spin-sound"
import { Confetti } from "./confetti"
import type { Props } from "./types"

const VISIBLE = 7
const ITEM_H = 50 // Increased from 44 to 50 for a more spacious, premium feel
const HEIGHT = VISIBLE * ITEM_H
const ANGLE_STEP = 24 
const RADIUS = 119 // Recalculated for ITEM_H = 50 (circumference 750px / 2pi)

export function RouletteWheel({
  participants,
  winnerIndex,
  spinning,
  onSpinEnd,
  onAnimatingChange,
}: Props) {
  const [animating, setAnimating] = useState(winnerIndex !== null)
  const [finished, setFinished] = useState(false)
  
  const wheelStripRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<gsap.core.Timeline | null>(null)

  // We repeat participants list to make a long scrolling strip for the spin animation
  const COPIES = 8
  const centerCopy = Math.floor(COPIES / 2) * participants.length
  
  const panelList = useMemo(() => {
    const list: typeof participants = []
    for (let c = 0; c < COPIES; c++) {
      list.push(...participants)
    }
    return list.map((p, i) => ({
      nombre: p.nombre,
      puestos: p.puestos,
      index: i,
    }))
  }, [participants, COPIES])

  // Target index for the winner on the strip
  const targetIdx = winnerIndex !== null ? centerCopy + winnerIndex : 0
  const targetRotationX = -targetIdx * ANGLE_STEP
  
  // Start the spin 3 full passes of participants list before the target
  const fullPassAngle = participants.length * ANGLE_STEP
  const initialRotationX = winnerIndex !== null ? targetRotationX + fullPassAngle * 2.5 : 0

  // Direct DOM updating function for 3D styling (opacity/visibility)
  const updateWheel3DEffects = useCallback((rotX: number) => {
    if (!wheelStripRef.current) return
    
    const children = wheelStripRef.current.children
    // We only show items facing the camera (within a 90 degree window)
    const visibleWindow = 90 
    
    for (let idx = 0; idx < children.length; idx++) {
      const el = children[idx] as HTMLElement
      if (!el) continue
      
      const itemAngle = idx * ANGLE_STEP
      const relativeAngle = itemAngle + rotX
      const absAngle = Math.abs(relativeAngle)
      
      if (absAngle < visibleWindow) {
        const rad = (relativeAngle * Math.PI) / 180
        const cosVal = Math.cos(rad)
        
        // Fading out opacity toward the top/bottom edges
        const opacity = Math.pow(cosVal, 1.6)
        
        el.style.opacity = `${opacity}`
        el.style.visibility = "visible"
      } else {
        el.style.opacity = "0"
        el.style.visibility = "hidden"
      }
    }
  }, [])

  const onSpinEndRef = useRef(onSpinEnd)
  const onAnimatingChangeRef = useRef(onAnimatingChange)

  useEffect(() => {
    onSpinEndRef.current = onSpinEnd
  }, [onSpinEnd])

  useEffect(() => {
    onAnimatingChangeRef.current = onAnimatingChange
  }, [onAnimatingChange])

  // Run initial 3D visibility layout updates on mount and on resets
  useEffect(() => {
    const initialRot = winnerIndex !== null ? initialRotationX : 0
    if (wheelStripRef.current) {
      gsap.set(wheelStripRef.current, { rotateX: initialRot })
    }
    updateWheel3DEffects(initialRot)
  }, [winnerIndex, initialRotationX, updateWheel3DEffects])

  useEffect(() => {
    if (winnerIndex === null) {
      setAnimating(false)
      setFinished(false)
      return
    }

    const timer = setTimeout(() => {
      setFinished(false)
      setAnimating(true)
      onAnimatingChangeRef.current?.(true)
      playSpinStart()

      // Set initial rotation
      if (wheelStripRef.current) {
        gsap.set(wheelStripRef.current, { rotateX: initialRotationX })
        updateWheel3DEffects(initialRotationX)
      }

      const totalRotationDiff = Math.abs(initialRotationX - targetRotationX)
      const itemsPassed = totalRotationDiff / ANGLE_STEP
      
      // Calculate a dynamic duration that feels good (approx 4.5 to 5.5 seconds)
      const duration = Math.max(4.2, Math.min(6.0, itemsPassed / 8))

      // Track ticks
      let lastTickAngle = initialRotationX
      const targetObj = { rotX: initialRotationX }

      // Single, unified animation to prevent conflicts and ensure full settle alignment
      animationRef.current = gsap.timeline({
        onComplete: () => {
          // Double check we land precisely on the target
          if (wheelStripRef.current) {
            gsap.set(wheelStripRef.current, { rotateX: targetRotationX })
            updateWheel3DEffects(targetRotationX)
          }
          setFinished(true)
          setAnimating(false)
          onAnimatingChangeRef.current?.(false)
          onSpinEndRef.current?.()
          playWin()
        }
      })

      // Smooth spin and organic overshoot settle (back.out)
      animationRef.current.to(targetObj, {
        rotX: targetRotationX,
        duration: duration,
        ease: "back.out(0.25)", // More subtle, ultra-smooth settle
        onUpdate: () => {
          if (wheelStripRef.current) {
            gsap.set(wheelStripRef.current, { rotateX: targetObj.rotX })
            updateWheel3DEffects(targetObj.rotX)
            
            // Sound tick logic: play tick when passing each item's threshold
            if (Math.abs(targetObj.rotX - lastTickAngle) >= ANGLE_STEP) {
              playTick()
              lastTickAngle = targetObj.rotX
            }
          }
        }
      })

    }, 400)

    return () => {
      clearTimeout(timer)
      if (animationRef.current) {
        animationRef.current.kill()
      }
    }
  }, [winnerIndex, targetRotationX, initialRotationX, updateWheel3DEffects])

  const isFinished = winnerIndex !== null && !animating && finished

  return (
    <div className="relative mx-auto w-full max-w-sm">
      {/* Confetti — outside the wheel container so it's not clipped */}
      {isFinished && (
        <div className="pointer-events-none absolute inset-0 -top-32 -bottom-32 -left-16 -right-16 z-50">
          <Confetti />
        </div>
      )}

      <div
        className="relative overflow-hidden rounded-[24px] border border-zinc-800/60 bg-zinc-950 shadow-2xl"
        style={{
          height: HEIGHT,
          perspective: "1000px",
        }}
      >
        {/* The 3D cylindrical container */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          <div
            ref={wheelStripRef}
            className="relative w-[92%]"
            style={{
              height: ITEM_H,
              transformStyle: "preserve-3d",
            }}
          >
            {panelList.map((p, i) => {
              const isWinnerPanel = winnerIndex !== null && p.index === targetIdx
              const itemAngle = i * ANGLE_STEP
              
              return (
                <div
                  key={p.index}
                  className={`absolute inset-0 flex items-center justify-between px-8 translate-y-[-2px] ${
                    isFinished && isWinnerPanel
                      ? ""
                      : isFinished
                      ? "opacity-25 transition-opacity duration-700 ease-out"
                      : ""
                  }`}
                  style={{
                    height: ITEM_H,
                    transform: `rotateX(${itemAngle}deg) translateZ(${RADIUS}px)`,
                    backfaceVisibility: "hidden",
                  }}
                >
                  <div
                    className="flex w-full items-center justify-between origin-center"
                    style={{
                      transform: isFinished && isWinnerPanel ? "scale(1.05)" : "scale(1)",
                      transition: "transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)",
                    }}
                  >
                    <span className={`text-[15px] font-semibold truncate tracking-wide transition-all duration-500 ${
                      isFinished && isWinnerPanel 
                        ? "text-violet-100 font-bold drop-shadow-[0_0_10px_rgba(167,139,250,0.6)]" 
                        : "text-zinc-300"
                    }`}>
                      {p.nombre}
                    </span>
                    
                    <span className={`text-xs font-semibold tabular-nums transition-all duration-500 ${
                      isFinished && isWinnerPanel 
                        ? "text-fuchsia-400 font-bold drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]" 
                        : "text-zinc-500"
                    }`}>
                      #{p.puestos.join(" · ")}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Outer overlay fades — cylinder styling */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-zinc-950 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-zinc-950 to-transparent" />

        {/* Central Selection Highlight Bracket (iOS DatePicker style) */}
        <div
          className={`pointer-events-none absolute inset-x-2 z-10 rounded-2xl border transition-all duration-700 ${
            isFinished
              ? "border-violet-500/50 border-l-4 border-l-violet-400 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/15 to-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.3),inset_0_1px_1px_rgba(255,255,255,0.15)]"
              : "border-white/10 border-l-[3px] border-l-white/30 bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
          }`}
          style={{
            top: 3 * ITEM_H,
            height: ITEM_H,
          }}
        />
      </div>
    </div>
  )
}
