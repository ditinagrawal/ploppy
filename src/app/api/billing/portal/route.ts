import db from "@/lib/db";
import { polar } from "@/lib/polar";
import { subscriptions } from "@/model/subscription.model";
import { getSession } from "@/lib/getSession";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, session.user.id));

    if (!sub?.polarCustomerId) {
      return NextResponse.json(
        { message: "No active subscription found" },
        { status: 404 }
      );
    }

    const portalSession = await polar.customerSessions.create({
      customerId: sub.polarCustomerId,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return NextResponse.redirect(portalSession.customerPortalUrl);
  } catch (error) {
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
  }
}
