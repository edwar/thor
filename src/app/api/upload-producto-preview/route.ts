import { NextResponse } from "next/server"
import { uploadProductoPreview } from "@/lib/actions/producto"

export async function POST(request: Request) {
  const formData = await request.formData()
  try {
    const result = await uploadProductoPreview(formData)
    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
