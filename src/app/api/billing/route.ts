import db from "@/lib/db";
import { chatbots } from "@/model/chatbot.model";
import { getSession } from "@/lib/getSession";
import { getPlan, FREE_LIMIT } from "@/lib/getPlan";
import { eq, count } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const plan = await getPlan(session.user.id);

    const [{ value: chatbotCount }] = await db
      .select({ value: count() })
      .from(chatbots)
      .where(eq(chatbots.ownerId, session.user.id));

    return NextResponse.json({
      plan,
      chatbotCount: Number(chatbotCount),
      limit: plan === "pro" ? null : FREE_LIMIT,
      canCreate: plan === "pro" || Number(chatbotCount) < FREE_LIMIT,
    });
  } catch (error) {
    return NextResponse.json({ message: `Error: ${error}` }, { status: 500 });
  }
}
