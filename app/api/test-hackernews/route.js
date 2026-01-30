import { NextResponse } from "next/server";
import { getHackerNewsStories } from "@/libs/hackerNews";

/**
 * Test endpoint to check if Hacker News API is working
 * GET /api/test-hackernews?category=technology&limit=15
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit")) || 15;
    const category = searchParams.get("category") || "technology";

    console.log(`📰 Fetching ${limit} stories from Hacker News (${category})`);

    const articles = await getHackerNewsStories(category, limit);

    return NextResponse.json({
      success: true,
      count: articles.length,
      message: articles.length === 0
        ? `No articles found for category "${category}"`
        : `${articles.length} articles found`,
      articles,
    });
  } catch (error) {
    console.error("❌ Error in test-hackernews:", error.message);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
