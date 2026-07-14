import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { textColorForBg } from "@/lib/color"
import { EmptyState } from "@/components/ui/empty-state"

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
        <div className="h-2 w-full bg-gradient-to-r from-thor-600 to-thor-400" />
      )}

      <div className="relative z-10 text-foreground" style={{ color: withBanner ? tc : undefined }}>
        <header className="flex items-center gap-4 px-6 py-8 sm:px-10">
          {perfil.logoUrl ? (
            <img
              src={perfil.logoUrl!}
              alt={perfil.nombrePublico}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-white/10"
            />
          ) : (
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white shadow-lg"
              style={{ backgroundColor: color }}
            >
              {perfil.nombrePublico.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{perfil.nombrePublico}</h1>
            {perfil.descripcion && (
              <p className="mt-1 max-w-xl text-muted-foreground">{perfil.descripcion}</p>
            )}
          </div>
        </header>

        <main className="px-6 pb-24 sm:px-10">
          {sorteoActivo && (
            <div
              className="mb-14 rounded-xl border p-6"
              style={{ borderColor: `${color}30`, backgroundColor: `${color}06` }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
                  style={{ backgroundColor: `${color}20` }}
                >
                  🎡
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: withBanner ? tc : color }}>
                    Sorteo activo
                  </p>
                  <p className="mt-1.5 text-xl font-bold">{sorteoActivo.titulo}</p>
                  {sorteoActivo.descripcion && (
                    <p className="mt-1 text-sm text-muted-foreground">{sorteoActivo.descripcion}</p>
                  )}
                  <p className="mt-3 text-sm text-muted-foreground">
                    Al comprar cualquier producto participas automáticamente en este sorteo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {productos.length === 0 ? (
            <EmptyState
              icon="📦"
              title="No hay productos disponibles aún"
              description="Este sorteador no tiene productos publicados en este momento."
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {productos.map((producto) => (
                <Link
                  key={producto.id}
                  href={`/p/${producto.id}`}
                  className="group rounded-xl border bg-card p-6 transition-all hover:shadow-md hover:-translate-y-0.5"
                  style={{ borderColor: `${color}20` }}
                >
                  <div
                    className="mb-4 h-2 w-10 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <h3 className="text-lg font-bold text-foreground group-hover:underline">
                    {producto.titulo}
                  </h3>
                  {producto.descripcion && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {producto.descripcion}
                    </p>
                  )}
                  <p className="mt-3 text-sm text-muted-foreground">
                    {producto.tipo} ·{" "}
                    <span className="font-semibold text-foreground">
                      ${Number(producto.precio).toLocaleString("es-CO")}
                    </span>
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
