"use client"

import { useState, useCallback } from "react"
import { ClientRouletteWheel } from "./client-roulette"
import type { Participant } from "./types"

interface Props {
  participants: Participant[]
  winnerIndex: number | null
  ganadorNombre: string
  ganadorPuestos: string
  commitHashHex: string
  revealSeed: string | null
  totalVendidos: number
}

export function RuletaClientWrapper({
  participants,
  winnerIndex,
  ganadorNombre,
  ganadorPuestos,
  commitHashHex,
  revealSeed,
  totalVendidos,
}: Props) {
  const [showResult, setShowResult] = useState(false)

  const handleAnimatingChange = useCallback((animating: boolean) => {
    if (!animating) setShowResult(true)
  }, [])

  return (
    <div className="mt-8 space-y-6">
      {/* Winner info — hidden until animation finishes */}
      {showResult && winnerIndex !== null && (
        <div className="rounded-xl border border-emerald-800/30 bg-emerald-900/15 p-6">
          <p className="text-sm text-muted-foreground">Ganador</p>
          <p className="mt-2 text-3xl font-bold text-emerald-400">{ganadorNombre}</p>
          <p className="mt-1 text-lg text-emerald-300">Puesto # {ganadorPuestos}</p>
        </div>
      )}

      {/* Verification info */}
      {showResult && (
        <div className="rounded-xl border border-border bg-card p-6 text-left">
          <p className="text-sm font-medium text-muted-foreground">Verificación del sorteo</p>
          <div className="mt-4 space-y-3 text-xs text-muted-foreground">
            <p>
              <span className="text-muted-foreground">Commit hash:</span>
              <br />
              <span className="font-mono break-all">{commitHashHex}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Seed revelado:</span>
              <br />
              <span className="font-mono break-all">{revealSeed ?? "—"}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Total participantes:</span> {totalVendidos}
            </p>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Puedes verificar el resultado:{" "}
            <code className="text-thor-400">sha256(seed) == commitHash</code>
          </p>
        </div>
      )}

      {/* Always-visible heading during spin */}
      {!showResult && (
        <p className="text-sm text-muted-foreground animate-pulse">Girando...</p>
      )}

      <div className="flex justify-center">
        <ClientRouletteWheel
          participants={participants}
          winnerIndex={winnerIndex}
          spinning={false}
          onAnimatingChange={handleAnimatingChange}
        />
      </div>
    </div>
  )
}
