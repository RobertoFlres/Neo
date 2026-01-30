import { NextResponse } from "next/server";
import { getNewsDataArticles } from "@/libs/newsData";

/**
 * Test endpoint for NewsData.io
 * GET /api/test-newsdata?category=technology
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "technology";
    const limit = parseInt(searchParams.get("limit")) || 15;

    console.log(`📰 Fetching from NewsData.io: ${category}`);

    const articles = await getNewsDataArticles(category, limit);

    return NextResponse.json({
      success: true,
      count: articles.length,
      message: articles.length === 0
        ? `No articles found for category "${category}"`
        : `${articles.length} articles found`,
      articles,
    });
  } catch (error) {
    console.error("❌ Error in test-newsdata:", error.message);

    if (error.message.includes("key")) {
      return NextResponse.json(
        {
          success: false,
          error: "NewsData API key not configured. Add NEWSDATA_API_KEY to .env.local",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
