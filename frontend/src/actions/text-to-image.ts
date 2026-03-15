"use server";

import {env} from "~/env";
import {auth} from "~/lib/auth";
import {headers} from "next/headers";
import {db} from "~/server/db";
import {cache} from "react";
import {s3Client} from "~/lib/s3_client";
import {DeleteObjectCommand} from "@aws-sdk/client-s3";
// import {getViewUrl} from "~/actions/download-image";

interface GenerateImageData {
  prompt: string;
  negative_prompt?: string;
  width: number;
  height: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  seed?: number;
  attention_backend?: string;
}

interface GenerateImageResult {
  success: boolean;
  s3_key?: string;
  viewUrl?: string;
  projectId?: string;
  seed?: number;
  modelId?: string;
  error?: string;
}

export async function generateImage(
    data: GenerateImageData,
): Promise<GenerateImageResult> {
  try {
    if (!env.MODAL_BACKEND_URL || !env.MODAL_KEY_ID || !env.MODAL_SECRET_KEY) {
      return {
        success: false,
        error: "Missing Modal environment variable - url, key id or secret key",
      };
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    if (!data.prompt || !data.width || !data.height)
      return { success: false, error: "Missing required fields" };

    const creditsNeeded = 1;

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });
    if (!user) return { success: false, error: "User not found" };
    if (user.credits < creditsNeeded)
      return {
        success: false,
        error: `Insufficient credits. Need ${creditsNeeded}, have ${user.credits}`,
      };

    const response = await fetch(env.MODAL_BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Modal-Key": env.MODAL_KEY_ID,
        "Modal-Secret": env.MODAL_SECRET_KEY,
      },
      body: JSON.stringify({
        prompt: data.prompt,
        negative_prompt: data.negative_prompt,
        width: data.width,
        height: data.height,
        num_inference_steps: data.num_inference_steps,
        guidance_scale: data.guidance_scale,
        seed: data.seed,
        attention_backend: data.attention_backend,
      }),
      signal: AbortSignal.timeout(300_000)
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return {
        success: false,
        error: text ? `Generate failed: ${text}` : "Failed to generate image",
      };
    }

    const result = (await response.json()) as {
      image_s3_key: string;
      image_url: string;
      seed: number;
      model_id: string;
    };

    const [, imageProject] = await db.$transaction([
      db.user.update({
        where: { id: session.user.id },
        data: { credits: { decrement: creditsNeeded } },
      }),
      db.imageProject.create({
        data: {
          prompt: data.prompt,
          negativePrompt: data.negative_prompt,
          s3Key: result.image_s3_key,
          width: data.width,
          height: data.height,
          numInferenceSteps: data.num_inference_steps ?? 9,
          guidanceScale: data.guidance_scale ?? 0,
          seed: BigInt(result.seed),
          modelId: result.model_id,
          userId: session.user.id,
        },
      }),
    ]);

    // const { url: viewUrl } = await getViewUrl(result.image_s3_key);

    return {
      success: true,
      s3_key: result.image_s3_key,
      // viewUrl: viewUrl,
      seed: result.seed,
      modelId: result.model_id,
      projectId: imageProject.id,
    };
  } catch (e) {
    console.error("Image generation error:", e);
    return { success: false, error: "Internal server error" }
  }
}


const PAGE_SIZE = 20;

export const getUserImageProjects = cache(async (page = 1) => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const skip = (page - 1) * PAGE_SIZE;

    const [imageProjects, total] = await db.$transaction([
        db.imageProject.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
          skip: skip,
          take: PAGE_SIZE,
        }),
        db.imageProject.count({
          where: { userId: session.user.id },
        }),
    ]);

    // Prisma BigInt values aren't JSON-serializable; convert seed to number.
    const safeProjects = imageProjects.map((project) => ({
      ...project,
      seed: Number(project.seed),
    }));

    return {
      success: true,
      imageProjects: safeProjects,
      pagination: {
        total,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil(total / PAGE_SIZE),
        hasNext: page * PAGE_SIZE < total,
        hasPrev: page > 1,
      },
    };
  } catch (e) {
    console.error("Error fetching image projects", e);
    return { success: false, error: "Failed to fetch image projects" }
  }
});


export async function deleteImageProject(id: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const project = await db.imageProject.findUnique({ where: { id } });
    if (!project || project.userId !== session.user.id)
      return { success: false, error: "Not found or unauthorized" };

    // Delete from S3 first
    await s3Client.send(
        new DeleteObjectCommand({
          Bucket: env.AWS_S3_BUCKET_NAME,
          Key: project.s3Key,
        }),
    );

    // Then delete from DB
    await db.imageProject.delete({ where: { id } });

    return { success: true };
  } catch (e) {
    console.error("Error deleting image project:", e);
    return { success: false, error: "Failed to delete image project" };
  }
}