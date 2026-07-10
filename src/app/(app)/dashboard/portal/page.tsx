import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateSorteadorProfile } from "@/lib/actions/portal"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SlugInput } from "@/components/slug-input"
import { PortalImages } from "@/components/portal-images"

export default async function PortalPage() {
  const session = await auth()
  if (!session?.user) redirect("/signin")

  const sorteador = await prisma.sorteadorProfile.findUnique({
    where: { userId: session.user.id },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Mi portal</h1>
        <p className="mt-1 text-zinc-400">
          Personaliza la apariencia de tu portal de sorteos.
        </p>
      </div>

      <form action={updateSorteadorProfile} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información pública</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombrePublico">Nombre público</Label>
              <Input
                id="nombrePublico"
                name="nombrePublico"
                defaultValue={sorteador?.nombrePublico ?? ""}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                rows={3}
                defaultValue={sorteador?.descripcion ?? ""}
                placeholder="Cuéntales a tus participantes de qué trata tu plataforma"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug del portal</Label>
              <SlugInput defaultValue={sorteador?.slug ?? ""} />
              {sorteador?.slug && (
                <a
                  href={`${process.env.NEXT_PUBLIC_APP_URL}/s/${sorteador.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-thor-500 hover:text-thor-400 transition-colors"
                >
                  {process.env.NEXT_PUBLIC_APP_URL}/s/{sorteador.slug}
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Apariencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="colorAcento">Color de acento</Label>
              <div className="flex items-center gap-3">
                <input
                  id="colorAcento"
                  name="colorAcento"
                  type="color"
                  defaultValue={sorteador?.colorAcento ?? "#6D28D9"}
                  className="h-10 w-10 cursor-pointer rounded-lg border border-zinc-700 bg-zinc-800"
                />
                <span className="text-sm text-zinc-500">{sorteador?.colorAcento ?? "#6D28D9"}</span>
              </div>
            </div>

            <PortalImages
              logoUrl={sorteador?.logoUrl ?? null}
              bannerUrl={sorteador?.bannerUrl ?? null}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                type="tel"
                defaultValue={sorteador?.telefono ?? ""}
                placeholder="+57 300 000 0000"
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="bg-thor-600 hover:bg-thor-500">
          Guardar cambios
        </Button>
      </form>
    </div>
  )
}
