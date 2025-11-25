import { NextResponse } from "next/server";
import { getStartuplinksArticles, getStartuplinksNews } from "@/libs/startuplinks";

/**
 * Test endpoint for Startuplinks.world
 * GET /api/test-startuplinks?limit=30&category=startups
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit")) || 30;
    const category = searchParams.get("category") || "startups";

    console.log(`📰 Fetching from Startuplinks.world: ${category}, limit: ${limit}`);

    // Use filtered news if category is specified, otherwise get all articles
    const articles = category && category !== "all" 
      ? await getStartuplinksNews(category, limit)
      : await getStartuplinksArticles(limit);

    return NextResponse.json({
      success: true,
      count: articles.length,
      message: articles.length === 0 
        ? `No articles found for ${category}` 
        : `${articles.length} articles found from Startuplinks.world`,
      articles: articles,
    });
  } catch (error) {
    console.error("❌ Error in test-startuplinks:", error.message);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

