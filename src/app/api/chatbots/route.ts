import db from "@/lib/db";
import { chatbots } from "@/model/chatbot.model";
import { getSession } from "@/lib/getSession";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET /api/chatbots — list all chatbots for the logged-in user
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const list = await db
      .select()
      .from(chatbots)
      .where(eq(chatbots.ownerId, session.user.id))
      .orderBy(chatbots.createdAt);

    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json(
      { message: `Failed to list chatbots: ${error}` },
      { status: 500 }
    );
  }
}

// POST /api/chatbots — create a new chatbot
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: "Chatbot name is required" },
        { status: 400 }
      );
    }

    const [chatbot] = await db
      .insert(chatbots)
      .values({
        ownerId: session.user.id,
        name: name.trim(),
      })
      .returning();

    return NextResponse.json(chatbot, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: `Failed to create chatbot: ${error}` },
      { status: 500 }
    );
  }
}
