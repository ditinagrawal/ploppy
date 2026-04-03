import db from "@/lib/db";
import { chatbots } from "@/model/chatbot.model";
import { getSession } from "@/lib/getSession";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET /api/chatbots/[id] — get a single chatbot
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const [chatbot] = await db
      .select()
      .from(chatbots)
      .where(and(eq(chatbots.id, id), eq(chatbots.ownerId, session.user.id)));

    if (!chatbot) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(chatbot);
  } catch (error) {
    return NextResponse.json(
      { message: `Failed to get chatbot: ${error}` },
      { status: 500 }
    );
  }
}

// PATCH /api/chatbots/[id] — update a chatbot
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.name !== undefined) updateData.name = body.name;
    if (body.supportEmail !== undefined) updateData.supportEmail = body.supportEmail;
    if (body.knowledge !== undefined) updateData.knowledge = body.knowledge;

    const [updated] = await db
      .update(chatbots)
      .set(updateData)
      .where(and(eq(chatbots.id, id), eq(chatbots.ownerId, session.user.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { message: `Failed to update chatbot: ${error}` },
      { status: 500 }
    );
  }
}

// DELETE /api/chatbots/[id] — delete a chatbot
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const [deleted] = await db
      .delete(chatbots)
      .where(and(eq(chatbots.id, id), eq(chatbots.ownerId, session.user.id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json(
      { message: `Failed to delete chatbot: ${error}` },
      { status: 500 }
    );
  }
}
