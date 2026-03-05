"use server";

import {cache} from "react";
import {auth} from "~/lib/auth";
import {headers} from "next/headers";
import {db} from "~/server/db";

export const getUserCredits = cache(async () => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized", credits: 0 }
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    if (!user) {
      return { success: false, error: "User not found", credits: 0 };
    }

    return { success: true, credits: user.credits };
  } catch (e) {
    console.error("Error fetching user credits:", e);
    return { success: false, error: "Failed to fetch credits", credits: 0 };
  }
});