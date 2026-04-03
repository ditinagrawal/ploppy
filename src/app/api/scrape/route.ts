import { firecrawl } from "@/lib/firecrawl";
import { getSession } from "@/lib/getSession";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { message: "URL is required" },
        { status: 400 }
      );
    }

    const result = await firecrawl.scrape(url, {
      formats: ["markdown"],
    });

    const content = result.markdown || "";
    if (!content) {
      return NextResponse.json(
        { message: "No content could be extracted from this URL" },
        { status: 400 }
      );
    }

    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json(
      { message: `Scrape error: ${error}` },
      { status: 500 }
    );
  }
}
