import { NextResponse } from "next/server";
import { readRSSFeed } from "@/libs/rssReader";

/**
 * Test endpoint for RSS feeds
 * GET /api/test-rss?url=https://example.com/rss&limit=5
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    const limit = parseInt(searchParams.get("limit")) || 10;

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: "URL parameter is required",
        },
        { status: 400 }
      );
    }

    console.log(`📡 Testing RSS feed: ${url}`);

    const articles = await readRSSFeed(url, limit);

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
      })),
    });
  } catch (error) {
    console.error("❌ Error in test-rss:", error.message);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

