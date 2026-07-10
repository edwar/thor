import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { toggleProductoActivo } from "@/lib/actions/productos"
import { ActiveSwitch } from "@/components/active-switch"

const tipoLabels: Record<string, string> = {
  VIDEO: "Video",
  IMAGEN: "Imagen",
  PDF: "PDF",
  ZIP: "ZIP",
}

export default async function ProductosPage() {
  const session = await auth()
  const sorteador = await prisma.sorteadorProfile.findUnique({
    where: { userId: session!.user.id },
  })

  const productos = sorteador
    ? await prisma.productoDigital.findMany({
        where: { sorteadorId: sorteador.id },
        orderBy: { createdAt: "desc" },
      })
    : []

  const sorteoActivo = sorteador
    ? await prisma.sorteo.findFirst({
        where: { sorteadorId: sorteador.id, estado: "ACTIVO" },
        select: { id: true, titulo: true },
      })
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Productos</h1>
          <p className="mt-1 text-zinc-400">
            Gestiona tus productos digitales. Los productos activos se asocian al sorteo activo.
          </p>
        </div>
        <Link
          href="/dashboard/productos/nuevo"
          className="rounded-lg bg-thor-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-thor-500"
        >
          + Nuevo producto
        </Link>
      </div>

      {sorteoActivo && (
        <div className="rounded-xl border border-thor-800 bg-thor-900/20 p-4 text-sm text-thor-200">
          Sorteo activo: <span className="font-semibold">{sorteoActivo.titulo}</span>
          {" — "}los productos activos se vinculan automáticamente.
        </div>
      )}

      {productos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 p-12 text-center">
          <p className="text-zinc-400">Aún no tienes productos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {productos.map((p) => (
            <div
              key={p.id}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-zinc-700"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold text-zinc-100">{p.titulo}</h3>
                  <span
                    className={`shrink-0 rounded border px-2 py-0.5 text-xs font-medium ${
                      p.activo
                        ? "border-green-800 text-green-400"
                        : "border-zinc-700 text-zinc-500"
                    }`}
                  >
                    {p.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-sm text-zinc-500">
                  <p>{tipoLabels[p.tipo]}</p>
                  <p>$ {Number(p.precio).toLocaleString("es-CO")}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <ActiveSwitch checked={p.activo} formAction={toggleProductoActivo.bind(null, p.id)} />
                <Link
                  href={`/dashboard/productos/${p.id}/edit`}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
