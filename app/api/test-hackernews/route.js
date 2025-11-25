import { NextResponse } from "next/server";
import { getHackerNewsStories } from "@/libs/hackerNews";

/**
 * Test endpoint to check if Hacker News API is working
 * GET /api/test-hackernews
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit")) || 10;
    const category = searchParams.get("category") || "technology";
    const country = searchParams.get("country") || "mx";

    console.log(`📰 Fetching ${limit} stories from Hacker News (${category})`);

    const articles = await getHackerNewsStories(category, country, limit);

    return NextResponse.json({
      success: true,
      count: articles.length,
      message: articles.length === 0 ? "No articles found" : `${articles.length} articles found`,
      articles: articles.map((article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source,
        publishedAt: article.publishedAt,
        score: article.score,
      })),
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

