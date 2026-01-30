import { NextResponse } from "next/server";
import { getContxtoNews } from "@/libs/contxto";

/**
 * Test endpoint for Contxto
 * GET /api/test-contxto?category=startups&limit=15
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "startups";
    const limit = parseInt(searchParams.get("limit")) || 15;

    console.log(`📰 Fetching ${limit} articles from Contxto (${category})`);

    const articles = await getContxtoNews(category, limit);

    return NextResponse.json({
      success: true,
      count: articles.length,
      message: articles.length === 0
        ? `No articles found for category "${category}"`
        : `${articles.length} articles found`,
      articles,
    });
  } catch (error) {
    console.error("❌ Error in test-contxto:", error.message);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
