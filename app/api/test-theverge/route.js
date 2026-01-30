import { NextResponse } from "next/server";
import { getTheVergeNews } from "@/libs/theVerge";

/**
 * Test endpoint for The Verge
 * GET /api/test-theverge?category=technology&limit=15
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "technology";
    const limit = parseInt(searchParams.get("limit")) || 15;

    console.log(`📰 Fetching ${limit} articles from The Verge (${category})`);

    const articles = await getTheVergeNews(category, limit);

    return NextResponse.json({
      success: true,
      count: articles.length,
      message: articles.length === 0
        ? `No articles found for category "${category}"`
        : `${articles.length} articles found`,
      articles,
    });
  } catch (error) {
    console.error("❌ Error in test-theverge:", error.message);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
