import * as THREE from "three"

export interface PanelData {
  nombre: string
  puestos: number[]
  index: number
  isWinner: boolean
}

export function createPanelTexture(data: PanelData): THREE.CanvasTexture {
  const canvas = document.createElement("canvas")
  const w = 280
  const h = 48
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")!

  const r = 8

  // Chip shape
  ctx.beginPath()
  ctx.moveTo(r, 0)
  ctx.lineTo(w - r, 0)
  ctx.quadraticCurveTo(w, 0, w, r)
  ctx.lineTo(w, h - r)
  ctx.quadraticCurveTo(w, h, w - r, h)
  ctx.lineTo(r, h)
  ctx.quadraticCurveTo(0, h, 0, h - r)
  ctx.lineTo(0, r)
  ctx.quadraticCurveTo(0, 0, r, 0)
  ctx.closePath()

  // Silver/chrome gradient for normal, purple glow for winner
  const grad = ctx.createLinearGradient(0, 0, w, 0)
  if (data.isWinner) {
    grad.addColorStop(0, "#3b1d8e")
    grad.addColorStop(0.3, "#6d28d9")
    grad.addColorStop(0.7, "#6d28d9")
    grad.addColorStop(1, "#3b1d8e")
  } else {
    grad.addColorStop(0, "#e4e4e7")
    grad.addColorStop(0.3, "#f4f4f5")
    grad.addColorStop(0.7, "#f4f4f5")
    grad.addColorStop(1, "#e4e4e7")
  }
  ctx.fillStyle = grad
  ctx.fill()

  // Subtle border
  ctx.strokeStyle = data.isWinner ? "rgba(139,92,246,0.7)" : "rgba(0,0,0,0.08)"
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Shine highlight at top
  const shine = ctx.createLinearGradient(0, 0, 0, h)
  shine.addColorStop(0, "rgba(255,255,255,0.25)")
  shine.addColorStop(0.4, "rgba(255,255,255,0)")
  ctx.fillStyle = shine
  ctx.fill()

  ctx.textBaseline = "middle"

  // Name
  ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif"
  ctx.textAlign = "left"
  ctx.fillStyle = data.isWinner ? "#e0e0ff" : "#1c1917"
  ctx.fillText(truncate(data.nombre, 22), 14, h / 2)

  // Position #
  ctx.font = "600 11px 'SF Mono', 'SF Pro Text', monospace"
  ctx.textAlign = "right"
  ctx.fillStyle = data.isWinner ? "#a78bfa" : "#78716c"
  ctx.fillText(`#${data.puestos.join(" · ")}`, w - 14, h / 2)

  // Winner glow overlay
  if (data.isWinner) {
    ctx.shadowColor = "rgba(139,92,246,0.6)"
    ctx.shadowBlur = 12
    ctx.strokeStyle = "rgba(139,92,246,0.5)"
    ctx.lineWidth = 2.5
    ctx.stroke()
    ctx.shadowBlur = 0
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  return s.slice(0, max - 1) + "…"
}
