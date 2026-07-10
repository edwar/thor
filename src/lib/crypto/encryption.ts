import crypto from "node:crypto"
import { env } from "@/lib/env"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16

function getKey(): Buffer {
  const keyHex = env.MASTER_KEY
  const key = Buffer.from(keyHex, "hex")
  if (key.length !== 32) {
    throw new Error("MASTER_KEY must be a 64-character hex string (32 bytes)")
  }
  return key
}

export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  let encrypted = cipher.update(plaintext, "utf8", "hex")
  encrypted += cipher.final("hex")
  const authTag = cipher.getAuthTag().toString("hex")
  return `${iv.toString("hex")}:${authTag}:${encrypted}`
}

export function decrypt(ciphertext: string): string {
  const key = getKey()
  const parts = ciphertext.split(":")
  if (parts.length !== 3) {
    throw new Error("Invalid ciphertext format")
  }
  const [ivHex, authTagHex, encrypted] = parts
  const iv = Buffer.from(ivHex, "hex")
  const authTag = Buffer.from(authTagHex, "hex")
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}
