import db from "@/lib/db";
import { chatbots } from "@/model/chatbot.model";
import { chatSessions } from "@/model/chat-session.model";
import { messages } from "@/model/message.model";
import { eq, asc } from "drizzle-orm";
import { getSession } from "@/lib/getSession";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { id, sessionId } = await params

        // Verify chatbot ownership
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

        // Verify session belongs to this chatbot
        const [chatSession] = await db
            .select()
            .from(chatSessions)
            .where(eq(chatSessions.id, sessionId))

        if (!chatSession || chatSession.chatbotId !== id) {
            return NextResponse.json({ message: "Session not found" }, { status: 404 })
        }

        // Get all messages for this session
        const sessionMessages = await db
            .select()
            .from(messages)
            .where(eq(messages.sessionId, sessionId))
            .orderBy(asc(messages.createdAt))

        return NextResponse.json({ session: chatSession, messages: sessionMessages })
    } catch (error) {
        return NextResponse.json({ message: `Error: ${error}` }, { status: 500 })
    }
}
