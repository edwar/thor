"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { deleteFile } from "@/lib/r2"

export async function updateSorteadorProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user.id) throw new Error("No autenticado")

  const nombrePublico = formData.get("nombrePublico") as string
  const descripcion = formData.get("descripcion") as string
  const colorAcento = formData.get("colorAcento") as string
  const telefono = formData.get("telefono") as string
  const slug = formData.get("slug") as string
  const logoUrl = formData.get("logoUrl") as string
  const bannerUrl = formData.get("bannerUrl") as string

  const profile = await prisma.sorteadorProfile.findUnique({
    where: { userId: session.user.id },
    select: { userId: true, logoUrl: true, bannerUrl: true },
  })

  const slugOwner = await prisma.sorteadorProfile.findUnique({
    where: { slug },
    select: { userId: true },
  })
  if (slugOwner && slugOwner.userId !== session.user.id) {
    throw new Error("Ese slug ya está en uso por otro portal")
  }

  const data = {
    slug,
    nombrePublico,
    descripcion: descripcion || null,
    colorAcento,
    telefono: telefono || null,
    ...(logoUrl ? { logoUrl } : {}),
    ...(bannerUrl ? { bannerUrl } : {}),
  }

  await prisma.sorteadorProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      ...data,
    },
    update: data,
  })

  const oldLogoKey = profile?.logoUrl ? extractKey(profile.logoUrl) : null
  const oldBannerKey = profile?.bannerUrl ? extractKey(profile.bannerUrl) : null
  const newLogoKey = logoUrl ? extractKey(logoUrl) : null
  const newBannerKey = bannerUrl ? extractKey(bannerUrl) : null

  if (oldLogoKey && newLogoKey && oldLogoKey !== newLogoKey) {
    await deleteFile(oldLogoKey).catch(() => {})
  }
  if (oldBannerKey && newBannerKey && oldBannerKey !== newBannerKey) {
    await deleteFile(oldBannerKey).catch(() => {})
  }

  revalidatePath("/dashboard/portal")
  revalidatePath(`/s/${slug}`)
}

function extractKey(url: string): string | null {
  const match = url.match(/[?&]key=([^&]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export async function updatePortalImage(type: "logo" | "banner", url: string) {
  const session = await auth()
  if (!session?.user.id) throw new Error("No autenticado")

  const profile = await prisma.sorteadorProfile.findUnique({
    where: { userId: session.user.id },
    select: { logoUrl: true, bannerUrl: true },
  })

  const oldKey = profile
    ? extractKey(type === "logo" ? profile.logoUrl ?? "" : profile.bannerUrl ?? "")
    : null
  const newKey = extractKey(url)

  await prisma.sorteadorProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      slug: `s-${session.user.id.slice(0, 8)}`,
      nombrePublico: "Mi Perfil",
      ...(type === "logo" ? { logoUrl: url } : { bannerUrl: url }),
    },
    update: type === "logo" ? { logoUrl: url } : { bannerUrl: url },
  })

  if (oldKey && newKey && oldKey !== newKey) {
    await deleteFile(oldKey).catch(() => {})
  }

  revalidatePath("/dashboard/portal")
}
