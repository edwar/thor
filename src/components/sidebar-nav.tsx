"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavLinkProps {
  href: string
  children: React.ReactNode
}

function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = href === "/dashboard" ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 text-sm transition ${
        isActive
          ? "bg-thor-600/20 text-thor-400 font-medium"
          : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
      }`}
    >
      {children}
    </Link>
  )
}

export function SidebarNav({ isAdmin }: { isAdmin: boolean }) {
  return (
    <nav className="flex flex-col gap-1">
      <NavLink href="/dashboard">Inicio</NavLink>
      <NavLink href="/dashboard/productos">Productos</NavLink>
      <NavLink href="/dashboard/sorteos">Mis sorteos</NavLink>
      <NavLink href="/dashboard/cuentas-cobro">Cuentas de cobro</NavLink>
      <NavLink href="/dashboard/pasarela">Pasarela de pago</NavLink>
      <NavLink href="/dashboard/portal">Mi portal</NavLink>
      {isAdmin && (
        <>
          <div className="my-2 border-t border-zinc-800" />
          <NavLink href="/admin">Admin panel</NavLink>
        </>
      )}
    </nav>
  )
}
