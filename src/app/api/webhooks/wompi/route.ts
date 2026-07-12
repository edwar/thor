import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getProvider } from "@/lib/payments/provider-factory"
import { decrypt } from "@/lib/crypto/encryption"
import { assignRandomPosition } from "@/lib/crypto/random-assign"
import { sendEmail } from "@/lib/email/send"
import { render } from "@react-email/components"
import { CompraConfirmadaEmail } from "@/lib/email/templates/compra-confirmada"
import { getSignedDownloadUrl } from "@/lib/r2"

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const body = JSON.parse(rawBody)

    const event = body as {
      data?: { transaction?: { reference: string; status: string; id: string } }
      signature?: { checksum: string }
    }

    const ref = event.data?.transaction?.reference
    if (!ref) {
      return NextResponse.json({ ok: false, error: "missing reference" }, { status: 400 })
    }

    const txRecord = await prisma.transaccionPasarela.findUnique({
      where: { referenciaExterna: ref },
      include: {
        bono: true,
        sorteo: {
          include: {
            sorteador: { include: { pasarelaConfig: true } },
            productos: true,
          },
        },
      },
    })
    if (!txRecord) {
      return NextResponse.json({ ok: false, error: "transaction not found" }, { status: 404 })
    }

    if (txRecord.estado === "APROBADA") {
      return NextResponse.json({ ok: true, message: "already processed" })
    }

    const configDoc = txRecord.sorteo.sorteador.pasarelaConfig
    if (!configDoc) {
      return NextResponse.json({ ok: false, error: "gateway config not found" }, { status: 500 })
    }

    const provider = getProvider(txRecord.proveedor)
    const integrityKey = configDoc.integrityKeyCif ? decrypt(configDoc.integrityKeyCif) : undefined

    const signature = event.signature?.checksum
    if (signature && integrityKey) {
      const isValid = provider.verifyWebhookSignature(rawBody, signature, {
        publicKey: "",
        privateKey: "",
        integrityKey,
        sandbox: configDoc.sandbox,
      })
      if (!isValid) {
        return NextResponse.json({ ok: false, error: "invalid signature" }, { status: 401 })
      }
    }

    const parsed = provider.parseTransactionEvent(body)

    if (parsed.status !== "APROBADA") {
      await prisma.transaccionPasarela.update({
        where: { id: txRecord.id },
        data: {
          estado: parsed.status,
          firmaWebhook: signature,
          webhookRecibidoAt: new Date(),
          rawPayload: body,
        },
      })
      return NextResponse.json({ ok: true, status: parsed.status })
    }

    const bono = txRecord.bono
    if (!bono) throw new Error("Bono not found")

    let puestos: number[] = []
    await prisma.$transaction(async (tx) => {
      await tx.transaccionPasarela.update({
        where: { id: txRecord.id },
        data: {
          estado: "APROBADA",
          metodoPago: parsed.method,
          firmaWebhook: signature,
          webhookRecibidoAt: new Date(),
          rawPayload: body,
        },
      })

      await tx.participanteBono.update({
        where: { id: bono.id },
        data: { estado: "PAGADO" },
      })

      puestos = await assignRandomPosition(tx, txRecord.sorteoId, bono.id, bono.cantidad)
    })

    const sorteo = txRecord.sorteo
    const producto = sorteo.productos[0]

    let descargaUrl: string | undefined
    if (producto?.archivoKey) {
      try {
        descargaUrl = await getSignedDownloadUrl(producto.archivoKey)
      } catch {
        descargaUrl = producto.archivoUrl
      }
    }

    const premioDescripcion =
      sorteo.tipoPremio === "FIJO"
        ? `$ ${Number(sorteo.premioFijo ?? 0).toLocaleString("es-CO")}`
        : `${sorteo.porcentajePremio}% del recaudo`

    const html = await render(
      CompraConfirmadaEmail({
        nombreComprador: bono.nombreComprador,
        tituloSorteo: sorteo.titulo,
        puestos,
        premioDescripcion,
        fechaSorteo: sorteo.fechaSorteo.toLocaleString("es-CO", {
          dateStyle: "full",
          timeStyle: "short",
        }),
        productoDescargaUrl: descargaUrl,
        sorteoSlug: sorteo.slug,
        nombreOrganizador: sorteo.sorteador.nombrePublico,
      }),
    )

    sendEmail({
      to: bono.emailComprador,
      subject: `🎉 ¡Tu bono para ${sorteo.titulo} está confirmado!`,
      html,
    }).catch((err) => console.error("[email error]", err))

    return NextResponse.json({ ok: true, status: "APROBADA" })
  } catch (error) {
    console.error("[webhook wompi error]", error)
    return NextResponse.json({ ok: false, error: "internal error" }, { status: 500 })
  }
}
