import { polar } from "@/lib/polar";
import { getSession } from "@/lib/getSession";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const checkout = await polar.checkouts.create({
      products: [process.env.POLAR_PRODUCT_ID!],
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      customerEmail: session.user.email,
      metadata: { userId: session.user.id },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
  }
}
