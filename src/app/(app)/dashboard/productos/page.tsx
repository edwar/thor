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
          <h1 className="text-2xl font-bold text-foreground">Productos</h1>
          <p className="mt-1 text-muted-foreground">
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
        <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{sorteoActivo.titulo}</span>
          {" — "}los productos activos se vinculan automáticamente.
        </div>
      )}

      {productos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-16 text-center">
          <p className="text-sm font-medium text-muted-foreground">Aún no tienes productos.</p>
          <p className="mt-1 text-xs text-muted-foreground/60">Crea tu primer producto para empezar a vender.</p>
        </div>
      ) : (
        <div>
          {productos.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-3.5 py-3 ${i < productos.length - 1 ? "border-b border-border" : ""}`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-muted to-muted/50 text-muted-foreground">
                <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-foreground">{p.titulo}</span>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                      p.activo
                        ? "bg-green-900/20 text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {p.activo && <span className="h-1 w-1 rounded-full bg-green-500" />}
                    {p.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{tipoLabels[p.tipo]}</span>
                  <span>$ {Number(p.precio).toLocaleString("es-CO")}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <ActiveSwitch checked={p.activo} formAction={toggleProductoActivo.bind(null, p.id)} />
                <Link
                  href={`/dashboard/productos/${p.id}/edit`}
                  className="rounded-md px-2.5 py-1 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
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
