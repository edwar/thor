import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")
  const currentSlug = request.nextUrl.searchParams.get("currentSlug")
  if (!slug || slug.length < 3) {
    return NextResponse.json({ available: false })
  }

  const existing = await prisma.sorteadorProfile.findUnique({
    where: { slug },
    select: { id: true },
  })

  const available = !existing || slug === currentSlug
  return NextResponse.json({ available })
}
