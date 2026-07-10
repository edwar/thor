import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { textColorForBg } from "@/lib/color"

interface Props {
  slug: string
}

export async function PortalPublicPage({ slug }: Props) {
  const perfil = await prisma.sorteadorProfile.findUnique({
    where: { slug },
    include: {
      productos: {
        where: { activo: true },
        orderBy: { createdAt: "desc" },
      },
      sorteos: {
        where: { estado: "ACTIVO" },
        take: 1,
      },
    },
  })

  if (!perfil) notFound()

  const color = perfil.colorAcento
  const withBanner = !!perfil.bannerUrl
  const tc = withBanner ? (textColorForBg(color) === "white" ? "#fff" : "#000") : undefined
  const sorteoActivo = perfil.sorteos[0] ?? null
  const productos = perfil.productos

  return (
    <div className="min-h-screen bg-bone">
      {withBanner ? (
        <div className="fixed inset-0 overflow-hidden">
          <img
            src={perfil.bannerUrl!}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0" style={{ backgroundColor: `${color}B3` }} />
        </div>
      ) : (
        <div className="h-2 w-full" style={{ backgroundColor: color }} />
      )}

      <div className="relative z-10" style={{ color: tc }}>
        <header className="flex items-center gap-4 px-6 py-6">
          {perfil.logoUrl ? (
            <img
              src={perfil.logoUrl!}
              alt={perfil.nombrePublico}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {perfil.nombrePublico.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{perfil.nombrePublico}</h1>
            {perfil.descripcion && (
              <p className="mt-1 opacity-70">{perfil.descripcion}</p>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-6 pb-24">
          {sorteoActivo && (
            <div className="mb-12 rounded-xl border p-6" style={{ borderColor: `${color}40`, backgroundColor: `${color}08` }}>
              <p className="text-sm font-bold uppercase tracking-widest" style={{ color }}>
                Sorteo activo
              </p>
              <p className="mt-2 text-xl font-bold">{sorteoActivo.titulo}</p>
              {sorteoActivo.descripcion && (
                <p className="mt-1 text-sm opacity-70">{sorteoActivo.descripcion}</p>
              )}
              <p className="mt-4 text-sm opacity-70">
                Al comprar cualquier producto participas automáticamente en este sorteo.
              </p>
            </div>
          )}

          {productos.length === 0 ? (
            <p className="opacity-60">No hay productos disponibles aún.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {productos.map((producto) => (
                <Link
                  key={producto.id}
                  href={`/p/${producto.id}`}
                  className="group"
                >
                  <h3 className="text-lg font-bold group-hover:underline">{producto.titulo}</h3>
                  {producto.descripcion && (
                    <p className="mt-1 text-sm opacity-70">{producto.descripcion}</p>
                  )}
                  <p className="mt-2 text-sm opacity-60">
                    {producto.tipo} · ${Number(producto.precio).toLocaleString("es-CO")}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
