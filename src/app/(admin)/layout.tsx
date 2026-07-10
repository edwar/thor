import Link from "next/link"
import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/signin")
  if (session.user.role !== "ADMIN") redirect("/dashboard")

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col border-r border-zinc-800 bg-zinc-950 p-6">
        <Link
          href="/admin"
          className="mb-6 text-xl font-bold tracking-tight text-thor-400"
        >
          THOR <span className="text-xs font-normal text-zinc-600">admin</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-2">
          <NavLink href="/admin">Dashboard</NavLink>
          <NavLink href="/admin/sorteos">Sorteos</NavLink>
          <NavLink href="/admin/cuentas-cobro">Cuentas de cobro</NavLink>
          <NavLink href="/admin/sorteadors">Sorteadors</NavLink>
        </nav>

        <div className="border-t border-zinc-800 pt-4">
          <div className="mb-3 text-sm text-zinc-400">
            {session.user.name ?? session.user.email}
          </div>
          <Link
            href="/dashboard"
            className="mb-2 block rounded-lg px-3 py-2 text-sm text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300"
          >
            Ir al dashboard
          </Link>
          <form
            action={async () => {
              "use server"
              await signOut()
            }}
          >
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
    >
      {children}
    </Link>
  )
}
