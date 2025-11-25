import { NextResponse } from "next/server";
import { getLandingNewsArticles, refreshLandingNews } from "@/libs/landingNews";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("refresh") === "true";
    const landingNews = await getLandingNewsArticles({ forceRefresh: force });

    return NextResponse.json({
      success: true,
      generatedAt: landingNews?.generatedAt,
      articles: landingNews?.articles || [],
    });
  } catch (error) {
    console.error("❌ Error getting landing news:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error fetching landing news" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const landingNews = await refreshLandingNews();
    return NextResponse.json({
      success: true,
      generatedAt: landingNews.generatedAt,
      articles: landingNews.articles,
    });
  } catch (error) {
    console.error("❌ Error refreshing landing news:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error refreshing landing news" },
      { status: 500 }
    );
  }
}
