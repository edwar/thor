import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <span className="text-7xl font-bold tracking-tighter text-thor-600/30">404</span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Página no encontrada</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        La página que buscas no existe o ha sido movida.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-thor-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-thor-500 active:scale-[0.97]"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
