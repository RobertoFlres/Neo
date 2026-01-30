export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getStartuplinksNews } from "@/libs/startuplinks";

/**
 * Test endpoint for Startuplinks.world
 * GET /api/test-startuplinks?category=startups&limit=15
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "startups";
    const limit = parseInt(searchParams.get("limit")) || 15;

    console.log(`📰 Fetching ${limit} articles from Startuplinks.world (${category})`);

    const articles = await getStartuplinksNews(category, limit);

    return NextResponse.json({
      success: true,
      count: articles.length,
      message: articles.length === 0
        ? `No articles found for category "${category}"`
        : `${articles.length} articles found`,
      articles,
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
