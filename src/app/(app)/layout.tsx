import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/signin")

  const isAdmin = session.user.role === "ADMIN"

  return (
    <div className="flex h-screen">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-background">
        <div className="flex items-center gap-3 border-b border-border px-6 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-thor-400 to-thor-600 text-sm font-bold text-white shadow-sm">
            T
          </div>
          <a
            href="/dashboard"
            className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-lg font-bold tracking-tight text-transparent"
          >
            Thor
          </a>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav isAdmin={isAdmin} />
        </div>

        <div className="border-t border-border px-6 py-4">
          <div className="mb-3 truncate text-sm text-muted-foreground">
            {session.user.name ?? session.user.email}
          </div>
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
