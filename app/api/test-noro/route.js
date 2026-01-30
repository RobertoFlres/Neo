import { NextResponse } from "next/server";
import { getNoroTechNews } from "@/libs/noro";

/**
 * Test endpoint for Noro.mx
 * GET /api/test-noro?category=technology&limit=15
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "technology";
    const limit = parseInt(searchParams.get("limit")) || 15;

    console.log(`📰 Fetching ${limit} articles from Noro.mx (${category})`);

    const articles = await getNoroTechNews(category, limit);

    return NextResponse.json({
      success: true,
      count: articles.length,
      message: articles.length === 0
        ? `No articles found for category "${category}"`
        : `${articles.length} articles found`,
      articles,
    });
  } catch (error) {
    console.error("❌ Error in test-noro:", error.message);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
