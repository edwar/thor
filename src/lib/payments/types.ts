export interface CheckoutParams {
  reference: string
  amountInCents: number
  currency: string
  customerEmail: string
  customerName: string
  redirectUrl: string
  webhookUrl: string
}

export interface CheckoutResult {
  redirectUrl: string
}

export interface WebhookEvent {
  event: string
  data: {
    transaction: {
      id: string
      amount_in_cents: number
      reference: string
      status: string
      customer_email?: string
      payment_method?: { type: string }
    }
  }
  signature?: {
    checksum: string
  }
  environment?: string
  timestamp?: number
  sent_at?: string
}

export interface PaymentProviderConfig {
  publicKey: string
  privateKey: string
  integrityKey?: string
  sandbox: boolean
}

export interface PaymentProvider {
  readonly name: string
  initCheckout(params: CheckoutParams, config: PaymentProviderConfig): Promise<CheckoutResult>
  verifyWebhookSignature(
    body: string,
    signature: string,
    config: PaymentProviderConfig,
  ): boolean
  parseTransactionEvent(body: unknown): {
    reference: string
    status: "APROBADA" | "RECHAZADA" | "FALLIDA" | "PENDIENTE"
    externalId: string
    amount: number
    method?: string
  }
}
