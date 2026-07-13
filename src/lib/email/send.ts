import { Resend } from "resend"
import { env } from "@/lib/env"

export const resend = env.RESEND_API_KEY
  ? new Resend(env.RESEND_API_KEY)
  : null

export async function sendEmail(params: {
  to: string
  subject: string
  html: string
}) {
  if (!resend) {
    console.log(`[email mock] To: ${params.to}, Subject: ${params.subject}`)
    return { id: "mock" }
  }

  return resend.emails.send({
    from: "Thor <edwaramayadiaz@gmail.com>",
    to: params.to,
    subject: params.subject,
    html: params.html,
  })
}
