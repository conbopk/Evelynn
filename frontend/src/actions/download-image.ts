"use server";

import {headers} from "next/headers";
import {GetObjectCommand} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {auth} from "~/lib/auth";
import {db} from "~/server/db";
import {env} from "~/env";
import {s3Client} from "~/lib/s3_client";

interface GetDownloadUrlResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

interface GetViewUrlResult {
  success: boolean;
  url?: string;
  error?: string;
}

// ──────────────────────── DISPLAY Image (inline, no force download) ────────────────────────
export async function getViewUrl(s3Key: string): Promise<GetViewUrlResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const imageProject = await db.imageProject.findFirst({
      where: { s3Key, userId: session.user.id },
      select: { id: true },
    });
    if (!imageProject) {
      return { success: false, error: "Image not found or access denied" };
    }

    const command = new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: s3Key,
      ResponseContentType: "image/png",
    })

    // View URL expires in 1 hour
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return { success: true, url };
  } catch (e) {
    console.error("View URL generation error:", e);
    return { success: false, error: "Failed to generate view link" };
  }
}

// ────────────────────────────── DOWNLOAD (force download) ──────────────────────────────────────
export async function getDownloadUrl(
    s3Key: string,
): Promise<GetDownloadUrlResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify user owns this image
    const imageProject = await db.imageProject.findFirst({
      where: {
        s3Key: s3Key,
        userId: session.user.id,
      },
      select: { id: true, s3Key: true },
    });

    if (!imageProject) {
      return { success: false, error: "Image not found or access denied" };
    }

    const filename = s3Key.split("/").pop() ?? "generated-image.png"

    const command = new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: s3Key,
      ResponseContentDisposition: `attachment; filename="${filename}"`,
      ResponseContentType: "image/png",
    });

    // Presigned URL expires in 5 minutes
    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return { success: true, url, filename };
  } catch (e) {
    console.error('Download URL generation error:', e);
    return { success: false, error: "Failed to generate download link" };
  }
}