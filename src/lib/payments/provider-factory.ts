import { decrypt } from "@/lib/crypto/encryption"
import { prisma } from "@/lib/prisma"
import { WompiProvider } from "./providers/wompi"
import type { PaymentProvider, PaymentProviderConfig } from "./types"

const providers = new Map<string, PaymentProvider>([
  ["WOMPI", new WompiProvider()],
])

export function getProvider(name: string): PaymentProvider {
  const provider = providers.get(name)
  if (!provider) throw new Error(`Unknown payment provider: ${name}`)
  return provider
}

export async function getProviderForSorteo(sorteoId: string): Promise<{
  provider: PaymentProvider
  config: PaymentProviderConfig
}> {
  const configDoc = await prisma.pasarelaConfig.findFirst({
    where: { sorteador: { sorteos: { some: { id: sorteoId } } } },
  })

  if (!configDoc) {
    throw new Error("Payment gateway not configured for this sorteo's organizer")
  }

  const provider = getProvider(configDoc.proveedor)

  const config: PaymentProviderConfig = {
    publicKey: decrypt(configDoc.publicKeyCif),
    privateKey: decrypt(configDoc.privateKeyCif),
    integrityKey: configDoc.integrityKeyCif ? decrypt(configDoc.integrityKeyCif) : undefined,
    sandbox: configDoc.sandbox,
  }

  return { provider, config }
}
