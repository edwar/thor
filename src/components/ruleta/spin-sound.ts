const AudioCtx = typeof window !== "undefined" ? window.AudioContext : null

let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!AudioCtx) throw new Error("No AudioContext available")
  if (!ctx) ctx = new AudioCtx()
  if (ctx.state === "suspended") ctx.resume()
  return ctx
}

export function playTick() {
  try {
    const c = getCtx()
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = "square"
    o.frequency.value = 800 + Math.random() * 400
    g.gain.setValueAtTime(0.06, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.04)
    o.connect(g).connect(c.destination)
    o.start(c.currentTime)
    o.stop(c.currentTime + 0.04)
  } catch {}
}

export function playWin() {
  try {
    const c = getCtx()
    const now = c.currentTime

    const notes = [523.25, 659.25, 783.99, 1046.5]

    notes.forEach((freq, i) => {
      const o = c.createOscillator()
      const g = c.createGain()
      o.type = "sine"
      o.frequency.value = freq
      const t = now + i * 0.12
      g.gain.setValueAtTime(0.15, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
      o.connect(g).connect(c.destination)
      o.start(t)
      o.stop(t + 0.4)
    })
  } catch {}
}

export function playSpinStart() {
  try {
    const c = getCtx()
    const now = c.currentTime
    const o = c.createOscillator()
    const g = c.createGain()
    o.type = "sawtooth"
    o.frequency.setValueAtTime(200, now)
    o.frequency.exponentialRampToValueAtTime(60, now + 0.3)
    g.gain.setValueAtTime(0.08, now)
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
    o.connect(g).connect(c.destination)
    o.start(now)
    o.stop(now + 0.4)
  } catch {}
}
