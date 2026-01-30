export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getEntrepreneurTechNews } from "@/libs/entrepreneurSpanish";

/**
 * Test endpoint for Entrepreneur Spanish
 * GET /api/test-entrepreneur-es?category=technology&limit=15
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit")) || 15;
    const category = searchParams.get("category") || "technology";

    console.log(`📰 Fetching ${limit} articles from Entrepreneur Spanish (${category})`);

    const articles = await getEntrepreneurTechNews(category, limit);

    return NextResponse.json({
      success: true,
      count: articles.length,
      message: articles.length === 0
        ? `No articles found for category "${category}"`
        : `${articles.length} articles found`,
      articles,
    });
  } catch (error) {
    console.error("❌ Error in test-entrepreneur-es:", error.message);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
