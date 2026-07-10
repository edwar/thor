import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { env } from "@/lib/env"

const r2Client = new S3Client({
  region: "auto",
  endpoint: env.CLOUDFLARE_R2_ENDPOINT ?? "",
  credentials: {
    accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? "",
  },
})

const BUCKET = env.CLOUDFLARE_R2_BUCKET ?? "thor-productos"

export async function uploadFile(key: string, body: Buffer, contentType: string) {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  )
}

export async function deleteFile(key: string) {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }),
  )
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600) {
  return getSignedUrl(
    r2Client,
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }),
    { expiresIn },
  )
}
