export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getTechNewsFromSource } from "@/libs/rssReader";

/**
 * Test endpoint for tech RSS sources
 * GET /api/test-rss-tech?source=xataka&limit=5
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const source = searchParams.get("source") || "xataka";
    const limit = parseInt(searchParams.get("limit")) || 10;

    console.log(`📡 Testing RSS source: ${source}`);

    const articles = await getTechNewsFromSource(source, limit);

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
    console.error("❌ Error in test-rss-tech:", error.message);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

