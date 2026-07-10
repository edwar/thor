import crypto from "node:crypto"
import type { PaymentProvider, PaymentProviderConfig, CheckoutParams, CheckoutResult } from "../types"

export class WompiProvider implements PaymentProvider {
  readonly name = "WOMPI"

  private baseUrl(config: PaymentProviderConfig) {
    return config.sandbox
      ? "https://sandbox.wompi.co/v1"
      : "https://production.wompi.co/v1"
  }

  private checkoutUrl(config: PaymentProviderConfig) {
    return config.sandbox
      ? "https://checkout.wompi.co/p"
      : "https://checkout.wompi.co/p"
  }

  async initCheckout(params: CheckoutParams, config: PaymentProviderConfig): Promise<CheckoutResult> {
    const integrityHash = this.computeSignature(params, config)
    const query = new URLSearchParams({
      "public-key": config.publicKey,
      currency: params.currency,
      "amount-in-cents": String(params.amountInCents),
      reference: params.reference,
      "redirect-url": params.redirectUrl,
      "customer-data:email": params.customerEmail,
      "customer-data:full-name": params.customerName,
      signature: integrityHash,
    })

    return {
      redirectUrl: `${this.checkoutUrl(config)}?${query.toString()}`,
    }
  }

  private computeSignature(params: CheckoutParams, config: PaymentProviderConfig): string {
    const integrityKey = config.integrityKey ?? config.privateKey
    const hash = crypto
      .createHash("sha256")
      .update(integrityKey + params.reference + params.amountInCents + params.currency)
      .digest("hex")
    return hash
  }

  verifyWebhookSignature(body: string, signature: string, config: PaymentProviderConfig): boolean {
    const integrityKey = config.integrityKey ?? config.privateKey
    const expected = crypto
      .createHash("sha256")
      .update(integrityKey + body)
      .digest("hex")
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  }

  parseTransactionEvent(body: unknown) {
    const event = body as {
      data?: {
        transaction?: {
          id: string
          amount_in_cents: number
          reference: string
          status: string
          customer_email?: string
          payment_method?: { type: string }
        }
      }
      signature?: { checksum: string }
    }

    const tx = event.data?.transaction
    if (!tx) {
      throw new Error("Invalid Wompi webhook payload: missing data.transaction")
    }

    const statusMap: Record<string, "APROBADA" | "RECHAZADA" | "FALLIDA" | "PENDIENTE"> = {
      APPROVED: "APROBADA",
      DECLINED: "RECHAZADA",
      ERROR: "FALLIDA",
      PENDING: "PENDIENTE",
    }

    return {
      reference: tx.reference,
      status: statusMap[tx.status] ?? "PENDIENTE",
      externalId: tx.id,
      amount: tx.amount_in_cents / 100,
      method: tx.payment_method?.type,
    }
  }
}
