import { uploadImagen } from "@/lib/actions/upload"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const formData = await request.formData()
  try {
    const result = await uploadImagen(formData)
    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
