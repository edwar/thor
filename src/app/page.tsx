import Link from "next/link"

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-2xl font-bold tracking-tight text-thor-400">
          THOR
        </span>
        <nav className="flex items-center gap-6">
          <Link
            href="/signin"
            className="rounded-lg bg-thor-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-thor-500"
          >
            Iniciar sesión
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
          Sorteos gamificados{" "}
          <span className="text-thor-400">en vivo</span> para tus productos
          digitales
        </h1>
        <p className="mt-6 max-w-xl text-lg text-zinc-400">
          Vende bonos, asigna puestos con aleatoriedad criptográfica verificable
          y celebra el sorteo con una ruleta en vivo estilo iOS. Tú cobras
          directo, nosotros cobramos solo el 1 %.
        </p>
        <div className="mt-10 flex gap-4">
          <Link
            href="/signin"
            className="rounded-lg bg-thor-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-thor-500"
          >
            Crear mi sorteo
          </Link>
          <Link
            href="#como-funciona"
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-8 py-3 text-base font-semibold text-zinc-100 transition hover:bg-zinc-800"
          >
            Cómo funciona
          </Link>
        </div>
      </main>

      <footer className="border-t border-zinc-800 px-6 py-6 text-center text-sm text-zinc-500">
        &copy; {new Date().getFullYear()} Thor. Todos los derechos reservados.
      </footer>
    </div>
  )
}
