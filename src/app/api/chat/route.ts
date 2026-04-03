import db from "@/lib/db";
import { settings } from "@/model/settings.model";
import { chatbots } from "@/model/chatbot.model";
import { eq } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { message, ownerId, chatbotId } = await req.json()
        if (!message || (!ownerId && !chatbotId)) {
            return NextResponse.json(
                { message: "message and ownerId or chatbotId is required" },
                { status: 400 }
            )
        }

        let businessName = ""
        let supportEmail = ""
        let knowledge = ""

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

        const response = NextResponse.json(res.text)
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
