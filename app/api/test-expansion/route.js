import { NextResponse } from "next/server";
import { getExpansionTechNews } from "@/libs/expansion";

/**
 * Test endpoint for Expansión
 * GET /api/test-expansion?category=technology&limit=15
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit")) || 15;
    const category = searchParams.get("category") || "technology";

    console.log(`📰 Fetching ${limit} articles from Expansión (${category})`);

    const articles = await getExpansionTechNews(category, limit);

    return NextResponse.json({
      success: true,
      count: articles.length,
      message: articles.length === 0
        ? `No articles found for category "${category}"`
        : `${articles.length} articles found`,
      articles,
    });
  } catch (error) {
    console.error("❌ Error in test-expansion:", error.message);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
