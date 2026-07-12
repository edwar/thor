export interface Participant {
  nombre: string
  puestos: number[]
}

export interface Props {
  participants: Participant[]
  winnerIndex: number | null
  spinning: boolean
  onSpinEnd?: () => void
  onAnimatingChange?: (v: boolean) => void
}
