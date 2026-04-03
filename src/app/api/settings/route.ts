import db from "@/lib/db";
import { settings } from "@/model/settings.model";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { ownerId, businessName, supportEmail, knowledge } = await req.json()
        if (!ownerId) {
            return NextResponse.json(
                { message: "owner id is required" },
                { status: 400 }
            )
        }
        const [result] = await db
            .insert(settings)
            .values({ ownerId, businessName, supportEmail, knowledge })
            .onConflictDoUpdate({
                target: settings.ownerId,
                set: { businessName, supportEmail, knowledge, updatedAt: new Date() },
            })
            .returning()
        return NextResponse.json(result)
    } catch (error) {
        return NextResponse.json(
            { message: `settings error ${error}` },
            { status: 500 }
        )
    }
}
