import Link from "next/link"
import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminNavLink } from "@/components/admin-nav-link"

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
      <aside className="flex w-64 flex-col border-r border-border bg-background p-6">
        <Link
          href="/admin"
          className="mb-6 text-lg font-bold tracking-tight"
        >
          <span className="bg-gradient-to-r from-thor-400 to-thor-300 bg-clip-text text-transparent">
            Thor
          </span>{" "}
          <span className="text-xs font-normal text-muted-foreground">admin</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          <AdminNavLink href="/admin">Dashboard</AdminNavLink>
          <AdminNavLink href="/admin/sorteos">Sorteos</AdminNavLink>
          <AdminNavLink href="/admin/comisiones">Comisiones</AdminNavLink>
          <AdminNavLink href="/admin/sorteadors">Sorteadores</AdminNavLink>
        </nav>

        <div className="border-t border-border pt-4">
          <div className="mb-3 text-sm text-muted-foreground">
            {session.user.name ?? session.user.email}
          </div>
          <Link
            href="/dashboard"
            className="mb-2 block rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
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
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-surface p-8">{children}</main>
    </div>
  )
}


