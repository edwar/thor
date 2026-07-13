import { prisma } from "@/lib/prisma"

export default async function AdminSorteadorsPage() {
  const sorteadors = await prisma.sorteadorProfile.findMany({
    include: {
      user: { select: { email: true, name: true } },
      _count: { select: { sorteos: true, cuentasCobro: true } },
      pasarelaConfig: { select: { proveedor: true, sandbox: true, updatedAt: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sorteadores</h1>
        <p className="mt-1 text-muted-foreground">
          Todos los organizadores registrados en la plataforma.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3.5 text-left font-medium text-muted-foreground">Nombre</th>
              <th className="px-4 py-3.5 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3.5 text-left font-medium text-muted-foreground">Slug</th>
              <th className="px-4 py-3.5 text-right font-medium text-muted-foreground">Sorteos</th>
              <th className="px-4 py-3.5 text-left font-medium text-muted-foreground">Pasarela</th>
              <th className="px-4 py-3.5 text-left font-medium text-muted-foreground">Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorteadors.map((s) => (
              <tr key={s.id} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{s.nombrePublico}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.user.email ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">/{s.slug}</td>
                <td className="px-4 py-3 text-right tabular-nums">{s._count.sorteos}</td>
                <td className="px-4 py-3">
                  {s.pasarelaConfig ? (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {s.pasarelaConfig.proveedor}
                      {s.pasarelaConfig.sandbox && " (sandbox)"}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Sin configurar</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {s.createdAt.toLocaleDateString("es-CO")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sorteadors.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            No hay sorteadors registrados.
          </p>
        )}
      </div>
    </div>
  )
}
