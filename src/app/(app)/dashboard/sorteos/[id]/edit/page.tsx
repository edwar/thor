import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateSorteo } from "@/lib/actions/sorteos"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default async function EditarSorteoPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const session = await auth()
  if (!session?.user) redirect("/signin")

  const sorteo = await prisma.sorteo.findUnique({
    where: { id },
    include: { productos: true, sorteador: true },
  })

  if (!sorteo || sorteo.sorteador.userId !== session.user.id) notFound()
  if (sorteo.estado !== "BORRADOR") redirect(`/dashboard/sorteos/${id}`)

  const updateAction = updateSorteo.bind(null, id)

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Editar sorteo</h1>
        <p className="mt-1 text-zinc-400">Solo puedes editar sorteos en estado Borrador.</p>
      </div>

      <form action={updateAction} className="space-y-8">
        <section className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="font-semibold text-zinc-100">Información del sorteo</h2>

          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input id="titulo" name="titulo" defaultValue={sorteo.titulo} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" name="descripcion" rows={3} defaultValue={sorteo.descripcion ?? ""} />
          </div>
        </section>

        <section className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="font-semibold text-zinc-100">Premio y bonos</h2>

          <div className="space-y-2">
            <Label htmlFor="tipoPremio">Tipo de premio</Label>
            <Select id="tipoPremio" name="tipoPremio" defaultValue={sorteo.tipoPremio}>
              <option value="FIJO">Premio fijo</option>
              <option value="PORCENTAJE">% del recaudo</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="premioFijo">Valor del premio fijo</Label>
            <Input id="premioFijo" name="premioFijo" type="number" defaultValue={Number(sorteo.premioFijo ?? "") ?? ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="porcentajePremio">Porcentaje del recaudo</Label>
            <Input id="porcentajePremio" name="porcentajePremio" type="number" defaultValue={sorteo.porcentajePremio ?? ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="precioBono">Precio por bono</Label>
            <Input id="precioBono" name="precioBono" type="number" defaultValue={Number(sorteo.precioBono)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalBonos">Capacidad máxima</Label>
            <Input id="totalBonos" name="totalBonos" type="number" defaultValue={sorteo.totalBonos} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rangoPuestosMin">Puesto mínimo</Label>
              <Input id="rangoPuestosMin" name="rangoPuestosMin" type="number" defaultValue={sorteo.rangoPuestosMin} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rangoPuestosMax">Puesto máximo</Label>
              <Input id="rangoPuestosMax" name="rangoPuestosMax" type="number" defaultValue={sorteo.rangoPuestosMax} />
            </div>
          </div>
        </section>

        <section className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="font-semibold text-zinc-100">Producto digital</h2>

          <div className="space-y-2">
            <Label htmlFor="productoTipo">Tipo</Label>
            <Select id="productoTipo" name="productoTipo" defaultValue={sorteo.productos[0]?.tipo ?? ""}>
              <option value="">Sin producto</option>
              <option value="VIDEO">Video</option>
              <option value="IMAGEN">Imagen</option>
              <option value="PDF">PDF</option>
              <option value="ZIP">ZIP</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productoTitulo">Título</Label>
            <Input id="productoTitulo" name="productoTitulo" defaultValue={sorteo.productos[0]?.titulo ?? ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productoArchivoUrl">URL del archivo</Label>
            <Input id="productoArchivoUrl" name="productoArchivoUrl" defaultValue={sorteo.productos[0]?.archivoUrl ?? ""} />
          </div>

          <input type="hidden" name="productoArchivoKey" id="productoArchivoKey" defaultValue={sorteo.productos[0]?.archivoKey ?? ""} />
          <input type="hidden" name="productoPreviewUrl" defaultValue={sorteo.productos[0]?.previewUrl ?? ""} />
          <input type="hidden" name="productoPreviewKey" defaultValue={sorteo.productos[0]?.previewKey ?? ""} />
        </section>

        <section className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="font-semibold text-zinc-100">Fechas</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Inicio venta</Label>
              <Input id="fechaInicio" name="fechaInicio" type="datetime-local"
                defaultValue={sorteo.fechaInicio.toISOString().slice(0, 16)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaCierre">Cierre venta</Label>
              <Input id="fechaCierre" name="fechaCierre" type="datetime-local"
                defaultValue={sorteo.fechaCierre.toISOString().slice(0, 16)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaSorteo">Sorteo en vivo</Label>
            <Input id="fechaSorteo" name="fechaSorteo" type="datetime-local"
              defaultValue={sorteo.fechaSorteo.toISOString().slice(0, 16)} required />
          </div>
        </section>

        <div className="flex gap-4">
          <button type="submit" className="rounded-lg bg-thor-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-thor-500">
            Guardar cambios
          </button>
          <a href={`/dashboard/sorteos/${id}`} className="rounded-lg border border-zinc-700 bg-zinc-900 px-6 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800">
            Cancelar
          </a>
        </div>
      </form>
    </div>
  )
}
