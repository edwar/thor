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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Sorteadors</h1>
        <p className="mt-1 text-zinc-400">
          Todos los organizadores registrados en la plataforma.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/80">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Nombre</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Email</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Slug</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-400">Sorteos</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Pasarela</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {sorteadors.map((s) => (
              <tr key={s.id} className="hover:bg-zinc-900/30">
                <td className="px-4 py-3 text-zinc-200 font-medium">{s.nombrePublico}</td>
                <td className="px-4 py-3 text-zinc-400">{s.user.email ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-500">/{s.slug}</td>
                <td className="px-4 py-3 text-right text-zinc-300">{s._count.sorteos}</td>
                <td className="px-4 py-3">
                  {s.pasarelaConfig ? (
                    <span className="text-xs text-zinc-400">
                      {s.pasarelaConfig.proveedor}
                      {s.pasarelaConfig.sandbox && " (sandbox)"}
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-600">Sin configurar</span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {s.createdAt.toLocaleDateString("es-CO")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sorteadors.length === 0 && (
          <p className="p-6 text-center text-sm text-zinc-500">
            No hay sorteadors registrados.
          </p>
        )}
      </div>
    </div>
  )
}
