import db from "@/lib/db";
import { subscriptions } from "@/model/subscription.model";
import { eq } from "drizzle-orm";

export const FREE_LIMIT = 3;

export async function getPlan(userId: string): Promise<"free" | "pro"> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId));

  if (sub?.status === "active" || sub?.status === "trialing") return "pro";
  return "free";
}
