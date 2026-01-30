import { NextResponse } from "next/server";
import { getNewsArticles } from "@/libs/newsApi";

/**
 * Test endpoint to check if News API is working
 * GET /api/test-news?category=technology
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "technology";
    const limit = parseInt(searchParams.get("limit")) || 15;

    console.log(`📰 Fetching news from category: ${category}`);

    const articles = await getNewsArticles(category, limit);

    return NextResponse.json({
      success: true,
      count: articles.length,
      message: articles.length === 0
        ? `No articles found for category "${category}"`
        : `${articles.length} articles found`,
      articles,
    });
  } catch (error) {
    console.error("❌ Error in test-news:", error.message);

    if (error.message.includes("key")) {
      return NextResponse.json(
        {
          success: false,
          error: "News API key not configured. Add NEWS_API_KEY to .env.local",
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
