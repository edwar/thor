import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { promoteToAdmin, isAdminUser } from "@/lib/actions/admin"
import Link from "next/link"

export default async function AdminSetupPage() {
  const session = await auth()
  if (!session?.user) redirect("/signin")

  const isAdmin = await isAdminUser()

  return (
    <div className="mx-auto max-w-md space-y-8 pt-16 text-center">
      {isAdmin ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-green-800 bg-green-900/20 p-6">
            <p className="text-lg font-semibold text-green-400">✓ Eres administrador</p>
            <p className="mt-2 text-sm text-zinc-400">
              Tienes acceso al panel de administración.
            </p>
            <Link
              href="/admin"
              className="mt-4 inline-block rounded-lg bg-thor-600 px-6 py-2 text-sm font-medium text-white hover:bg-thor-500"
            >
              Ir al admin panel →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-zinc-100">Configuración de admin</h1>
          <p className="text-zinc-400">
            Ingresa el código secreto para activar tu cuenta como administrador de Thor.
          </p>

          <form
            action={async (formData: FormData) => {
              "use server"
              const secret = formData.get("secret") as string
              try {
                await promoteToAdmin(secret)
              } catch {
                throw new Error("Secret inválido")
              }
              redirect("/dashboard/admin")
            }}
            className="space-y-4"
          >
            <input
              type="password"
              name="secret"
              required
              placeholder="Admin secret key"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-center text-sm text-zinc-100 placeholder-zinc-500"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-thor-600 px-6 py-3 text-sm font-medium text-white hover:bg-thor-500"
            >
              Activar admin
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
