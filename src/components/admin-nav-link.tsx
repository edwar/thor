"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function AdminNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = href === "/admin" ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      data-active={isActive || undefined}
      className="rounded-lg px-3 py-2 text-sm transition-all data-[active]:bg-thor-600/15 data-[active]:text-thor-400 data-[active]:font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {children}
    </Link>
  )
}
