import Link from "next/link"

const features = [
  {
    title: "Venta de bonos",
    desc: "Vende bonos digitales con precios fijos y número limitado de participantes. Cada comprador recibe un puesto único.",
    icon: "🎟️",
  },
  {
    title: "Aleatoriedad verificable",
    desc: "Usamos SHA-256 commit-reveal: el seed se publica antes del sorteo y se revela al ejecutarlo. Tú puedes verificar el resultado.",
    icon: "🔐",
  },
  {
    title: "Ruleta en vivo",
    desc: "Experiencia gamificada con animaciones tipo iOS. Los participantes ven el sorteo en tiempo real desde cualquier dispositivo.",
    icon: "🎡",
  },
  {
    title: "Comisión justa",
    desc: "Solo cobramos el 1 % del recaudo cuando el sorteo se completa. Sin mensualidades, sin costos ocultos.",
    icon: "⚡",
  },
  {
    title: "Pagos locales",
    desc: "Integración con Wompi y Bold. Tus compradores pagan con PSE, Nequi, Daviplata o tarjeta de crédito.",
    icon: "💳",
  },
  {
    title: "Tu portal público",
    desc: "Cada sorteador tiene un portal personalizable con logo, banner y enlace propio para compartir.",
    icon: "🌐",
  },
]

const steps = [
  { num: "01", title: "Regístrate", desc: "Crea tu cuenta con Google en segundos." },
  { num: "02", title: "Configura", desc: "Sube tu producto digital, define el premio y conecta tu pasarela de pago." },
  { num: "03", title: "Comparte", desc: "Comparte el enlace de tu sorteo. Los compradores eligen su puesto." },
  { num: "04", title: "Sortea en vivo", desc: "Llega la fecha, cierra ventas, revela el seed y activa la ruleta." },
]

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-thor-600/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-amber-accent-500/5 blur-[100px]" />
      </div>

      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="bg-gradient-to-r from-thor-400 to-thor-300 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
          Thor
        </span>
        <nav className="flex items-center gap-4">
          <Link
            href="/signin"
            className="rounded-lg bg-thor-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-thor-500 hover:shadow-lg hover:shadow-thor-600/25 active:scale-[0.97]"
          >
            Iniciar sesión
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="flex flex-col items-center px-6 pt-24 pb-20 text-center sm:px-10 sm:pt-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-thor-700/40 bg-thor-950/50 px-4 py-1.5 text-xs font-medium text-thor-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-thor-400 animate-pulse" />
            Plataforma SaaS premium
          </div>

          <h1 className="mt-8 max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
            Sorteos gamificados{" "}
            <span className="bg-gradient-to-r from-thor-400 via-thor-300 to-amber-accent-300 bg-clip-text text-transparent">
              en vivo
            </span>{" "}
            para tus productos digitales
          </h1>

          <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
            Vende bonos, asigna puestos con aleatoriedad criptográfica verificable
            y celebra el sorteo con una ruleta en vivo. Tú cobras directo,
            nosotros solo el 1 %.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signin"
              className="rounded-lg bg-thor-600 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-thor-500 hover:shadow-lg hover:shadow-thor-600/30 active:scale-[0.97]"
            >
              Crear mi sorteo
            </Link>
            <Link
              href="#como-funciona"
              className="rounded-lg border border-border bg-surface px-8 py-3.5 text-base font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.97]"
            >
              Cómo funciona
            </Link>
          </div>
        </section>

        <section id="como-funciona" className="border-t border-border px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">
                Cómo funciona
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                De la configuración a la ruleta en{" "}
                <span className="text-thor-400">4 pasos</span>
              </h2>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <div key={step.num} className="group relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-thor-600/10 text-sm font-bold text-thor-400 ring-1 ring-thor-600/20">
                    {step.num}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground">
                Todo lo que necesitas
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Una plataforma,{" "}
                <span className="text-thor-400">cero complicaciones</span>
              </h2>
            </div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-xl border border-border bg-surface p-6 transition-all hover:border-thor-700/40 hover:shadow-lg hover:shadow-thor-600/5"
                >
                  <span className="text-2xl">{f.icon}</span>
                  <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              ¿Listo para lanzar tu primer sorteo?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Configura tu portal en minutos y empieza a vender bonos con la
              mejor experiencia gamificada del mercado.
            </p>
            <Link
              href="/signin"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-thor-600 px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-thor-500 hover:shadow-lg hover:shadow-thor-600/30 active:scale-[0.97]"
            >
              Crear mi sorteo gratis
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Thor. Todos los derechos reservados.
      </footer>
    </div>
  )
}
