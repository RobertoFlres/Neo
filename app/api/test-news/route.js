import { NextResponse } from "next/server";
import { getNewsArticles } from "@/libs/newsApi";

/**
 * Test endpoint to check if News API is working
 * GET /api/test-news
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "technology";
    const country = searchParams.get("country") || "us";

    console.log(`📰 Fetching news from category: ${category}, country: ${country}`);

    const articles = await getNewsArticles(category, country, 10);

    return NextResponse.json({
      success: true,
      count: articles.length,
      message: articles.length === 0 ? `No articles found for ${country} - ${category}` : `${articles.length} articles found`,
      articles: articles.map((article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
      })),
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

