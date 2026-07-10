import { NextRequest, NextResponse } from "next/server"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
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

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key")
  if (!key) {
    return new NextResponse("Missing key", { status: 400 })
  }

  try {
    const { Body, ContentType, CacheControl } = await r2Client.send(
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: key,
      }),
    )

    if (!Body) {
      return new NextResponse("Not found", { status: 404 })
    }

    const bytes = await Body.transformToByteArray()
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": ContentType ?? "application/octet-stream",
        "Cache-Control": CacheControl ?? "public, max-age=31536000, immutable",
        "CDN-Cache-Control": "public, max-age=31536000",
      },
    })
  } catch {
    return new NextResponse("Not found", { status: 404 })
  }
}
