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
      <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-3 border-b border-zinc-800 px-6 py-5">
          <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0">
            <defs>
              <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
            <path d="M8 22V10h4l4 6 4-6h4v12h-4v-7l-4 6-4-6v7H8z" fill="white" />
          </svg>
          <a href="/dashboard" className="text-lg font-bold tracking-tight text-zinc-100">
            Thor
          </a>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav isAdmin={isAdmin} />
        </div>

        <div className="border-t border-zinc-800 px-6 py-4">
          <div className="mb-3 text-sm text-zinc-400 truncate">
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
