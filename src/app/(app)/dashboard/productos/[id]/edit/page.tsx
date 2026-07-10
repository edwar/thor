import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EditarProductoForm } from "./form"

export default async function EditarProductoPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const session = await auth()
  if (!session?.user) redirect("/signin")

  const producto = await prisma.productoDigital.findUnique({
    where: { id },
    include: { sorteador: { select: { userId: true } } },
  })
  if (!producto || producto.sorteador.userId !== session.user.id) notFound()

  return <EditarProductoForm producto={JSON.parse(JSON.stringify(producto))} />
}
