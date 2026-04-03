import db from "@/lib/db";
import { settings } from "@/model/settings.model";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { ownerId } = await req.json()
        if (!ownerId) {
            return NextResponse.json(
                { message: "owner id is required" },
                { status: 400 }
            )
        }
        const [setting] = await db
            .select()
            .from(settings)
            .where(eq(settings.ownerId, ownerId))
        return NextResponse.json(setting ?? null)
    } catch (error) {
        return NextResponse.json(
            { message: `get setting error ${error}` },
            { status: 500 }
        )
    }
}
