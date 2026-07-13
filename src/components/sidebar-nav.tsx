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
      data-active={isActive || undefined}
      className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all data-[active]:bg-thor-600/15 data-[active]:text-thor-400 data-[active]:font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {isActive && (
        <span className="h-1.5 w-1.5 rounded-full bg-thor-400" />
      )}
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
      <NavLink href="/dashboard/cuentas-cobro">Comisiones</NavLink>
      <NavLink href="/dashboard/pasarela">Pasarela de pago</NavLink>
      <NavLink href="/dashboard/portal">Mi portal</NavLink>
      {isAdmin && (
        <>
          <div className="my-2 border-t border-border" />
          <NavLink href="/admin">Admin panel</NavLink>
        </>
      )}
    </nav>
  )
}
