import { NextResponse } from "next/server"
import { ejecutarSorteo } from "@/lib/sorteo-engine"

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params

  try {
    const result = await ejecutarSorteo(id)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
