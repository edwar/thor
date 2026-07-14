import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "Thor — Sorteos Gamificados en Vivo",
    template: "%s | Thor",
  },
  description:
    "La plataforma SaaS premium para vender productos digitales con sorteos gamificados en vivo. Vende bonos, asigna puestos con aleatoriedad criptográfica y celebra el sorteo con ruleta en vivo.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "Thor — Sorteos Gamificados en Vivo",
    description:
      "Vende productos digitales con sorteos gamificados en vivo. Tecnología criptográfica verificable, ruleta en vivo y comisión del 1%.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
