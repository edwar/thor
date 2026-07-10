import type { Metadata } from "next"
import { Inter, Geist } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: {
    default: "Thor — Sorteos Gamificados en Vivo",
    template: "%s | Thor",
  },
  description:
    "La plataforma SaaS premium para vender productos digitales con sorteos gamificados en vivo.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  )
}
