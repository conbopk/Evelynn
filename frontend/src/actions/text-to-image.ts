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

const MAX_DIM = 2048;
const MIN_DIM = 256;
const PAGE_SIZE = 20;

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

    if (!data.prompt.trim())
      return { success: false, error: "Prompt cannot be empty" };

    if (!Number.isInteger(data.width) || data.width < MIN_DIM || data.width > MAX_DIM)
      return { success: false, error: `Width must be between ${MIN_DIM} and ${MAX_DIM}` };

    if (!Number.isInteger(data.height) || data.height < MIN_DIM || data.height > MAX_DIM)
      return { success: false, error: `Height must be between ${MIN_DIM} and ${MAX_DIM}` };

    if (
        data.num_inference_steps !== undefined &&
        (!Number.isInteger(data.num_inference_steps) || data.num_inference_steps <= 0)
    ) {
      return { success: false, error: "num_inference_steps must be a positive integer" };
    }

    if (
        data.guidance_scale !== undefined &&
        (!Number.isFinite(data.guidance_scale) || data.guidance_scale < 0)
    ) {
      return { success: false, error: "guidance_scale must be a non-negative number" };
    }

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
      seed: result.seed,
      modelId: result.model_id,
      projectId: imageProject.id,
    };
  } catch (e) {
    console.error("Image generation error:", e);
    return { success: false, error: "Internal server error" }
  }
}


export const getUserImageProjects = cache(async () => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const imageProjects = await db.imageProject.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
          take: PAGE_SIZE,
        });

    // Prisma BigInt values aren't JSON-serializable; convert seed to number.
    const safeProjects = imageProjects.map((project) => ({
      ...project,
      seed: Number(project.seed),
    }));

    return {
      success: true,
      imageProjects: safeProjects,
    };
  } catch (e) {
    console.error("Error fetching image projects", e);
    return { success: false, error: "Failed to fetch image projects" }
  }
});


export async function getUserImageProjectsPaginated(cursor?: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const [imageProjects, total] = await db.$transaction([
      db.imageProject.findMany({
        where: { userId: session.user.id },
        orderBy: [
          { createdAt: "desc" },
          { id: "desc" },
        ],
        take: PAGE_SIZE + 1,            // take another 1 to see if there is still the next page
        ...(cursor ? {
          cursor: { id: cursor },
          skip: 1,                      // ignore the cursor record itself
        } : {}),
      }),
      db.imageProject.count({
        where: { userId: session.user.id },
      }),
    ]);

    const hasNext = imageProjects.length > PAGE_SIZE;
    const items = hasNext ? imageProjects.slice(0, PAGE_SIZE) : imageProjects;
    const nextCursor = hasNext ? items[items.length - 1]?.id : undefined;

    const safeProjects = items.map((p) => ({
      ...p,
      seed: Number(p.seed),
    }));

    return {
      success: true,
      imageProjects: safeProjects,
      pagination: {
        total,
        nextCursor,
        hasNext,
      },
    };
  } catch (e) {
    console.error("Error fetching image projects", e);
    return { success: false, error: "Failed to fetch image projects" };
  }
}


export async function getUserImageStats() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const now = new Date();

    // Get the first Monday of the current week (0 = Sunday, 1 = Monday,...)
    const dayOfWeek = now.getDay(); // 0 (Sun) -> 6 (Sat)
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday goes back 6, the rest goes back dayOfWeek - 1
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);   // reset to 00:00:00 Monday

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, thisWeek, thisMonth] = await db.$transaction([
        db.imageProject.count({
          where: { userId: session.user.id },
        }),
        db.imageProject.count({
          where: {
            userId: session.user.id,
            createdAt: { gte: startOfWeek },
          },
        }),
        db.imageProject.count({
          where: {
            userId: session.user.id,
            createdAt: { gte: startOfMonth },
          },
        }),
    ]);

    return { success: true, total, thisWeek, thisMonth}
  } catch (e) {
    console.error("Error fetching image stats:", e);
    return { success: false, error: "Failed to fetch stats" }
  }
}


export async function deleteImageProject(id: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const project = await db.imageProject.findUnique({ where: { id } });
    if (project?.userId !== session.user.id)
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