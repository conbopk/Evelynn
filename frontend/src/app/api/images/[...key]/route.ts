import { type NextRequest, NextResponse} from "next/server";
import {auth} from "~/lib/auth";
import {headers} from "next/headers";
import {db} from "~/server/db";
import {GetObjectCommand} from "@aws-sdk/client-s3";
import {env} from "~/env";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {s3Client} from "~/lib/s3_client";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ key: string[] }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;
  const s3Key = key.join("/");  // reconstruct "images/uuid.png"

  // Verify ownership
  const imageProject = await db.imageProject.findFirst({
    where: { s3Key, userId: session.user.id },
    select: { id: true },
  });
  if (!imageProject) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const command = new GetObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: s3Key,
    ResponseContentType: "image/png"
  });

  // Short expiry cause redirect immediately
  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

  // Redirect browser to S3 presigned URL
  // Cache-Control: browser cache 55 seconds, avoid hitting routes too much
  return NextResponse.redirect(presignedUrl, {
    status: 302,
    headers: {
      "Cache-Control": "private, max-age=55",
    },
  });
}