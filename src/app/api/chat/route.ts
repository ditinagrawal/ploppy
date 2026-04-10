import db from "@/lib/db";
import { settings } from "@/model/settings.model";
import { chatbots } from "@/model/chatbot.model";
import { chatSessions } from "@/model/chat-session.model";
import { messages } from "@/model/message.model";
import { eq } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { message, ownerId, chatbotId, sessionId } = await req.json()
        if (!message || (!ownerId && !chatbotId)) {
            return NextResponse.json(
                { message: "message and ownerId or chatbotId is required" },
                { status: 400 }
            )
        }

        let businessName = ""
        let supportEmail = ""
        let knowledge = ""
        let resolvedChatbotId: string | null = chatbotId || null

        if (chatbotId) {
            const [chatbot] = await db
                .select()
                .from(chatbots)
                .where(eq(chatbots.id, chatbotId))
            if (!chatbot) {
                return NextResponse.json(
                    { message: "chatbot not found." },
                    { status: 400 }
                )
            }
            businessName = chatbot.name || ""
            supportEmail = chatbot.supportEmail || ""
            knowledge = chatbot.knowledge || ""
        } else {
            const [setting] = await db
                .select()
                .from(settings)
                .where(eq(settings.ownerId, ownerId))
            if (!setting) {
                return NextResponse.json(
                    { message: "chat bot is not configured yet." },
                    { status: 400 }
                )
            }
            businessName = setting.businessName || ""
            supportEmail = setting.supportEmail || ""
            knowledge = setting.knowledge || ""
        }

        // Resolve or create session (only when chatbotId is available)
        let activeSessionId: string | null = null
        if (resolvedChatbotId) {
            if (sessionId) {
                // Verify session belongs to this chatbot
                const [existing] = await db
                    .select()
                    .from(chatSessions)
                    .where(eq(chatSessions.id, sessionId))
                if (existing && existing.chatbotId === resolvedChatbotId) {
                    activeSessionId = existing.id
                }
            }
            if (!activeSessionId) {
                const [newSession] = await db
                    .insert(chatSessions)
                    .values({ chatbotId: resolvedChatbotId })
                    .returning()
                activeSessionId = newSession.id
            }
        }

        // Store user message
        if (activeSessionId) {
            await db.insert(messages).values({
                sessionId: activeSessionId,
                role: "user",
                content: message,
            })
        }

        const KNOWLEDGE = `
        business name- ${businessName || "not provided"}
        supportEmail- ${supportEmail || "not provided"}
        knowledge- ${knowledge || "not provided"}
        `

        const prompt = `
You are a professional customer support assistant for this business.

Use ONLY the information provided below to answer the customer's question.
You may rephrase, summarize, or interpret the information if needed.
Do NOT invent new policies, prices, or promises.



--------------------
BUSINESS INFORMATION
--------------------
${KNOWLEDGE}

--------------------
CUSTOMER QUESTION
--------------------
${message}

--------------------
ANSWER
--------------------
`;

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const res = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const aiText = res.text || ""

        // Store assistant message
        if (activeSessionId) {
            await db.insert(messages).values({
                sessionId: activeSessionId,
                role: "assistant",
                content: aiText,
            })
        }

        const response = NextResponse.json({ response: aiText, sessionId: activeSessionId })
        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type");
        return response

    } catch (error) {
        const response = NextResponse.json(
            { message: `chat error ${error}` },
            { status: 500 }
        )
        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type");
        return response
    }
}

export const OPTIONS = async () => {
    return NextResponse.json(null, {
        status: 201,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
    })
}
