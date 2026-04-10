import db from "@/lib/db";
import { chatbots } from "@/model/chatbot.model";
import { chatSessions } from "@/model/chat-session.model";
import { messages } from "@/model/message.model";
import { eq, desc, count } from "drizzle-orm";
import { getSession } from "@/lib/getSession";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        // Verify ownership
        const [chatbot] = await db
            .select()
            .from(chatbots)
            .where(eq(chatbots.id, id))

        if (!chatbot) {
            return NextResponse.json({ message: "Chatbot not found" }, { status: 404 })
        }
        if (chatbot.ownerId !== session.user.id) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 })
        }

        // Get all sessions with message count
        const sessions = await db
            .select({
                id: chatSessions.id,
                chatbotId: chatSessions.chatbotId,
                createdAt: chatSessions.createdAt,
                updatedAt: chatSessions.updatedAt,
                messageCount: count(messages.id),
            })
            .from(chatSessions)
            .leftJoin(messages, eq(messages.sessionId, chatSessions.id))
            .where(eq(chatSessions.chatbotId, id))
            .groupBy(chatSessions.id)
            .orderBy(desc(chatSessions.createdAt))

        return NextResponse.json(sessions)
    } catch (error) {
        return NextResponse.json({ message: `Error: ${error}` }, { status: 500 })
    }
}
