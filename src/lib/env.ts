import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().url().startsWith("postgres"),
  DIRECT_URL: z.string().url().startsWith("postgres"),
  DIRECT_DATABASE_URL: z.string().url().startsWith("postgres").optional(),
  AUTH_SECRET: z.string().min(32),
  AUTH_GOOGLE_ID: z.string().min(1),
  AUTH_GOOGLE_SECRET: z.string().min(1),
  AUTH_URL: z.string().url().optional(),
  MASTER_KEY: z.string().min(32),
  RESEND_API_KEY: z.string().min(1).optional(),
  CLOUDFLARE_R2_ENDPOINT: z.string().optional(),
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().optional(),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().optional(),
  CLOUDFLARE_R2_BUCKET: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  ADMIN_SECRET_KEY: z.string().optional(),
})

function initEnv() {
  if (!process.env.DIRECT_URL && process.env.DIRECT_DATABASE_URL) {
    process.env.DIRECT_URL = process.env.DIRECT_DATABASE_URL
  }

  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors)
    if (typeof process.env.CI !== "undefined" || process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment variables")
    }
    return envSchema.partial().parse(process.env) as z.infer<typeof envSchema>
  }
  return parsed.data
}

export const env = initEnv()
