import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Gift, Receipt, CreditCard, TrendingUp } from "lucide-react"

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bienvenido{sorteador?.nombrePublico ? `, ${sorteador.nombrePublico}` : ""}
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            Panel de control de tu plataforma de sorteos
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Gift className="h-5 w-5 text-thor-400" />}
          label="Sorteos creados"
          value={sorteador?._count.sorteos ?? 0}
        />
        <StatCard
          icon={<Receipt className="h-5 w-5 text-thor-400" />}
          label="Cuentas de cobro"
          value={sorteador?._count.cuentasCobro ?? 0}
        />
        <StatCard
          icon={<CreditCard className="h-5 w-5 text-thor-400" />}
          label="Pasarela"
          value={
            sorteador?.pasarelaConfig
              ? `${sorteador.pasarelaConfig.proveedor}${sorteador.pasarelaConfig.sandbox ? " (sandbox)" : ""}`
              : "No configurada"
          }
        />
      </div>

      {!sorteador?.pasarelaConfig && (
        <div className="rounded-xl border border-amber-accent-800/30 bg-amber-accent-900/10 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-accent-500/10">
              <TrendingUp className="h-5 w-5 text-amber-accent-400" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-amber-accent-300">
                Configura tu pasarela de pago
              </h2>
              <p className="mt-1 text-sm text-amber-accent-300/60">
                Para empezar a vender bonos, debes registrar las llaves de tu
                pasarela (Wompi / Bold).
              </p>
              <a
                href="/dashboard/pasarela"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-amber-accent-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-amber-accent-500"
              >
                Configurar ahora
              </a>
            </div>
          </div>
        </div>
      )}

      {!sorteador && <OnboardingWizard />}
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-thor-700/30 hover:shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-thor-600/10 ring-1 ring-thor-600/20">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-2xl font-bold">{value}</p>
        </div>
      </div>
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
      className="rounded-xl border border-thor-800/30 bg-thor-900/15 p-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-thor-600/10">
          <Gift className="h-5 w-5 text-thor-400" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-thor-300">
            Configura tu portal de sorteador
          </h2>
          <p className="mt-1 text-sm text-thor-300/60">
            Elige un nombre público y un slug para tu portal.
          </p>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <label htmlFor="nombrePublico" className="block text-sm text-muted-foreground">
                Nombre público
              </label>
              <input
                id="nombrePublico"
                name="nombrePublico"
                required
                className="mt-1 w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-thor-600/50 focus:ring-1 focus:ring-thor-600/20"
                placeholder="Ej: Tu Marca"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="slug" className="block text-sm text-muted-foreground">
                Slug del portal
              </label>
              <input
                id="slug"
                name="slug"
                required
                pattern="^[a-z0-9-]+$"
                className="mt-1 w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-thor-600/50 focus:ring-1 focus:ring-thor-600/20"
                placeholder="Ej: tu-marca"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 rounded-lg bg-thor-600 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-thor-500 active:scale-[0.97]"
          >
            Guardar
          </button>
        </div>
      </div>
    </form>
  )
}
