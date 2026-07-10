import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function DashboardPage() {
  const session = await auth()
  const sorteador = await prisma.sorteadorProfile.findUnique({
    where: { userId: session!.user.id },
    include: {
      _count: { select: { sorteos: true, cuentasCobro: true } },
      pasarelaConfig: { select: { proveedor: true, sandbox: true } },
    },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">
          Bienvenido{sorteador?.nombrePublico ? `, ${sorteador.nombrePublico}` : ""}
        </h1>
        <p className="mt-1 text-zinc-400">
          Panel de control de tu plataforma de sorteos
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Sorteos creados"
          value={sorteador?._count.sorteos ?? 0}
        />
        <StatCard
          label="Cuentas de cobro"
          value={sorteador?._count.cuentasCobro ?? 0}
        />
        <StatCard
          label="Pasarela"
          value={
            sorteador?.pasarelaConfig
              ? `${sorteador.pasarelaConfig.proveedor}${sorteador.pasarelaConfig.sandbox ? " (sandbox)" : ""}`
              : "No configurada"
          }
        />
      </div>

      {!sorteador?.pasarelaConfig && (
        <div className="rounded-xl border border-amber-800 bg-amber-900/20 p-6">
          <h2 className="font-semibold text-amber-200">
            Configura tu pasarela de pago
          </h2>
          <p className="mt-1 text-sm text-amber-300/70">
            Para empezar a vender bonos, debes registrar las llaves de tu
            pasarela (Wompi / Bold).
          </p>
          <a
            href="/dashboard/pasarela"
            className="mt-4 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-500"
          >
            Configurar ahora
          </a>
        </div>
      )}

      {!sorteador && (
        <OnboardingWizard />
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-zinc-100">{value}</p>
    </div>
  )
}

async function OnboardingWizard() {
  return (
    <form
      action={async (formData: FormData) => {
        "use server"
        const { auth } = await import("@/lib/auth")
        const { prisma } = await import("@/lib/prisma")
        const session = await auth()

        if (!session?.user.id) return

        const slug = formData.get("slug") as string
        const nombre = formData.get("nombrePublico") as string

        await prisma.sorteadorProfile.create({
          data: {
            userId: session.user.id,
            slug,
            nombrePublico: nombre,
          },
        })
      }}
      className="rounded-xl border border-thor-800 bg-thor-900/20 p-6"
    >
      <h2 className="font-semibold text-thor-200">
        Configura tu portal de sorteador
      </h2>
      <p className="mt-1 text-sm text-thor-300/70">
        Elige un nombre público y un slug para tu portal.
      </p>

      <div className="mt-4 flex flex-wrap gap-4">
        <div className="flex-1">
          <label htmlFor="nombrePublico" className="block text-sm text-zinc-400">
            Nombre público
          </label>
          <input
            id="nombrePublico"
            name="nombrePublico"
            required
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500"
            placeholder="Ej: Tu Marca"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="slug" className="block text-sm text-zinc-400">
            Slug del portal
          </label>
          <input
            id="slug"
            name="slug"
            required
            pattern="^[a-z0-9-]+$"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500"
            placeholder="Ej: tu-marca"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 rounded-lg bg-thor-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-thor-500"
      >
        Guardar
      </button>
    </form>
  )
}
