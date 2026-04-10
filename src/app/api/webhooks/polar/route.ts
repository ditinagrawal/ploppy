import db from "@/lib/db";
import { subscriptions } from "@/model/subscription.model";
import { eq, sql } from "drizzle-orm";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.text();

  try {
    const event = validateEvent(
      body,
      {
        "webhook-id": req.headers.get("webhook-id") ?? "",
        "webhook-timestamp": req.headers.get("webhook-timestamp") ?? "",
        "webhook-signature": req.headers.get("webhook-signature") ?? "",
      },
      process.env.POLAR_WEBHOOK_SECRET!
    );

    // Subscription created, updated, activated, or uncanceled → mark as pro
    if (
      event.type === "subscription.created" ||
      event.type === "subscription.updated" ||
      event.type === "subscription.active" ||
      event.type === "subscription.uncanceled"
    ) {
      const sub = event.data;
      const userId = sub.metadata?.userId as string | undefined;
      if (!userId) return NextResponse.json({ received: true });

      const status =
        sub.status === "active" || sub.status === "trialing"
          ? sub.status
          : "inactive";

      await db
        .insert(subscriptions)
        .values({
          userId,
          polarCustomerId: sub.customerId,
          polarSubscriptionId: sub.id,
          status,
        })
        .onConflictDoUpdate({
          target: subscriptions.userId,
          set: {
            polarCustomerId: sub.customerId,
            polarSubscriptionId: sub.id,
            status,
            updatedAt: sql`now()`,
          },
        });
    }

    // Subscription canceled or revoked → downgrade to free
    if (
      event.type === "subscription.canceled" ||
      event.type === "subscription.revoked"
    ) {
      const sub = event.data;
      const userId = sub.metadata?.userId as string | undefined;
      if (!userId) return NextResponse.json({ received: true });

      await db
        .update(subscriptions)
        .set({ status: "canceled", updatedAt: sql`now()` })
        .where(eq(subscriptions.userId, userId));
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    if (e instanceof WebhookVerificationError) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
