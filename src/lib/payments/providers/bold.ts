import type { CheckoutParams, CheckoutResult } from "../types"

export class BoldProvider {
  readonly name = "BOLD"

  async initCheckout(_params: CheckoutParams, _config: Record<string, string>): Promise<CheckoutResult> {
    throw new Error("Bold provider not yet implemented")
  }

  verifyWebhookSignature(_body: string, _signature: string, _config: Record<string, string>): boolean {
    throw new Error("Bold provider not yet implemented")
  }

  parseTransactionEvent(_body: unknown) {
    throw new Error("Bold provider not yet implemented")
  }
}
