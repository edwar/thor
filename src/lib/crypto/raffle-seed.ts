import crypto from "node:crypto"

export function generateSeed(): string {
  return crypto.randomBytes(32).toString("hex")
}

export function commitHash(seed: string): string {
  return crypto.createHash("sha256").update(seed).digest("hex")
}

export function computeWinnerIndex(
  revealSeed: string,
  puestosSnapshot: { id: string; puestos: number[] }[],
  // total is now ignored — uses weighted puestos
  _total: number,
): number {
  const snapshotStr = JSON.stringify(puestosSnapshot)
  const seedFinal = crypto
    .createHash("sha256")
    .update(revealSeed + snapshotStr)
    .digest("hex")

  const puestosFlat: { id: string; puesto: number }[] = []
  for (const p of puestosSnapshot) {
    for (const puesto of p.puestos) {
      puestosFlat.push({ id: p.id, puesto })
    }
  }

  const bigIntHash = BigInt("0x" + seedFinal)
  const ganadorPuesto = puestosFlat[Number(bigIntHash % BigInt(puestosFlat.length))]

  const winnerIndex = puestosSnapshot.findIndex((p) => p.id === ganadorPuesto.id)
  return winnerIndex
}

export function verifyReveal(
  revealSeed: string,
  expectedCommitHash: string,
): boolean {
  const computed = commitHash(revealSeed)
  return crypto.timingSafeEqual(
    Buffer.from(computed, "hex"),
    Buffer.from(expectedCommitHash, "hex"),
  )
}
