import { NextResponse } from "next/server";
import { getWiredNews } from "@/libs/wired";

/**
 * Test endpoint for Wired
 * GET /api/test-wired?category=technology&limit=15
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "technology";
    const limit = parseInt(searchParams.get("limit")) || 15;

    console.log(`📰 Fetching ${limit} articles from Wired (${category})`);

    const articles = await getWiredNews(category, limit);

    return NextResponse.json({
      success: true,
      count: articles.length,
      message: articles.length === 0
        ? `No articles found for category "${category}"`
        : `${articles.length} articles found`,
      articles,
    });
  } catch (error) {
    console.error("❌ Error in test-wired:", error.message);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
