import { NextResponse } from "next/server";
import { getTechCrunchStories } from "@/libs/techcrunch";

/**
 * Test endpoint to check if TechCrunch RSS feed is working
 * GET /api/test-techcrunch?category=technology&limit=15
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit")) || 15;
    const category = searchParams.get("category") || "technology";

    console.log(`📰 Fetching ${limit} stories from TechCrunch (${category})`);

    const articles = await getTechCrunchStories(category, limit);

    return NextResponse.json({
      success: true,
      count: articles.length,
      message: articles.length === 0
        ? `No articles found for category "${category}"`
        : `${articles.length} articles found`,
      articles,
    });
  } catch (error) {
    console.error("❌ Error in test-techcrunch:", error.message);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
