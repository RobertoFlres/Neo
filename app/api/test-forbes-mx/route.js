import { NextResponse } from "next/server";
import { getForbesMexicoNews } from "@/libs/forbesMexico";

/**
 * Test endpoint for Forbes México
 * GET /api/test-forbes-mx?category=business&limit=15
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "business";
    const limit = parseInt(searchParams.get("limit")) || 15;

    console.log(`📰 Fetching ${limit} articles from Forbes México (${category})`);

    const articles = await getForbesMexicoNews(category, limit);

    return NextResponse.json({
      success: true,
      count: articles.length,
      message: articles.length === 0
        ? `No articles found for category "${category}"`
        : `${articles.length} articles found`,
      articles,
    });
  } catch (error) {
    console.error("❌ Error in test-forbes-mx:", error.message);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
