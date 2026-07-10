import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/crypto/encryption"
import { redirect } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { FormSelect } from "@/components/form-select"
const API_URLS = {
  WOMPI: { sandbox: "https://sandbox.wompi.co/v1", prod: "https://production.wompi.co/v1" },
  BOLD: { sandbox: "https://api.bold.co/sandbox/v1", prod: "https://api.bold.co/v1" },
}

export default async function PasarelaPage() {
  const session = await auth()
  if (!session?.user) redirect("/signin")

  const sorteador = await prisma.sorteadorProfile.findUnique({
    where: { userId: session.user.id },
    include: { pasarelaConfig: true },
  })

  const config = sorteador?.pasarelaConfig

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">
          Pasarela de pago
        </h1>
        <p className="mt-1 text-zinc-400">
          Registra las llaves de tu cuenta de Wompi o Bold. Tus clientes pagarán
          directamente a tu cuenta.
        </p>
      </div>

      {config && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="font-semibold text-zinc-100">Configuración actual</h2>
          <div className="mt-3 space-y-1 text-sm text-zinc-400">
            <p>Proveedor: <span className="text-zinc-200">{config.proveedor}</span></p>
            <p>
              Modo:{" "}
              <span className="text-zinc-200">
                {config.sandbox ? "Sandbox (pruebas)" : "Producción"}
              </span>
            </p>
            <p>Última actualización: {config.updatedAt.toLocaleDateString("es-CO")}</p>
          </div>
        </div>
      )}

      <form
        action={async (formData: FormData) => {
          "use server"
          const proveedor = formData.get("proveedor") as string
          const publicKey = formData.get("publicKey") as string
          const privateKey = formData.get("privateKey") as string
          const integrityKey = (formData.get("integrityKey") as string) || undefined
          const sandbox = formData.get("sandbox") === "on"

          const session = await auth()
          if (!session?.user.id) return

          const sorteador = await prisma.sorteadorProfile.findUnique({
            where: { userId: session.user.id },
          })
          if (!sorteador) return

          await prisma.pasarelaConfig.upsert({
            where: { sorteadorId: sorteador.id },
            create: {
              sorteadorId: sorteador.id,
              proveedor: proveedor as "WOMPI" | "BOLD",
              publicKeyCif: encrypt(publicKey),
              privateKeyCif: encrypt(privateKey),
              integrityKeyCif: integrityKey ? encrypt(integrityKey) : undefined,
              sandbox,
            },
            update: {
              proveedor: proveedor as "WOMPI" | "BOLD",
              publicKeyCif: encrypt(publicKey),
              privateKeyCif: encrypt(privateKey),
              integrityKeyCif: integrityKey ? encrypt(integrityKey) : undefined,
              sandbox,
            },
          })
        }}
        className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
      >
        <h2 className="mb-6 text-lg font-semibold text-zinc-100">
          {config ? "Actualizar configuración" : "Nueva configuración"}
        </h2>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="proveedor">Proveedor</Label>
            <FormSelect
              name="proveedor"
              required
              defaultValue={config?.proveedor ?? "WOMPI"}
              options={[
                { value: "WOMPI", label: "Wompi" },
                { value: "BOLD", label: "Bold" },
              ]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="publicKey">Llave pública (public_key)</Label>
            <Input id="publicKey" name="publicKey" required placeholder="pub_..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="privateKey">Llave privada (private_key)</Label>
            <Input id="privateKey" name="privateKey" required type="password" placeholder="••••••••" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="integrityKey">Integrity key (webhook, Wompi) / Events key (Bold)</Label>
            <Input id="integrityKey" name="integrityKey" type="password" placeholder="Opcional, necesaria para verificar webhooks" />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="sandbox"
              defaultChecked={config?.sandbox ?? true}
              className="size-4 rounded-[4px] border border-input bg-input/30 text-primary accent-thor-600"
            />
            <span className="text-sm text-zinc-300">
              Modo sandbox (pruebas)
            </span>
          </label>
        </div>

        <Button type="submit" className="mt-6 bg-thor-600 hover:bg-thor-500">
          {config ? "Actualizar" : "Guardar configuración"}
        </Button>
      </form>
    </div>
  )
}
