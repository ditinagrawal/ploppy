import { polar } from "@/lib/polar";
import { getSession } from "@/lib/getSession";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Derive origin from the request so this works on any deployment (Vercel, localhost, etc.)
    const origin =
      req.headers.get("origin") ||
      req.headers.get("x-forwarded-host")
        ? `https://${req.headers.get("x-forwarded-host")}`
        : process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

    const checkout = await polar.checkouts.create({
      products: [process.env.POLAR_PRODUCT_ID!],
      successUrl: `${origin}/dashboard?upgraded=true`,
      customerEmail: session.user.email,
      metadata: { userId: session.user.id },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("[billing/checkout]", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
