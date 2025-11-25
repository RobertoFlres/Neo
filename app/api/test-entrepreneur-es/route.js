import { NextResponse } from "next/server";
import { getEntrepreneurSpanishArticles } from "@/libs/entrepreneurSpanish";

/**
 * Test endpoint for Entrepreneur Spanish
 * GET /api/test-entrepreneur-es
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit")) || 10;
    const category = searchParams.get("category") || "startups";

    console.log(`📰 Fetching ${limit} articles from Entrepreneur Spanish (category: ${category})`);

    const articles = await getEntrepreneurSpanishArticles(limit * 2); // Get more to filter

    // Apply category filtering using keywords
    const keywords = {
      technology: ["IA", "inteligencia artificial", "tecnología", "tech", "ChatGPT", "AI", "software", "semiconductores", "digital", "innovación", "edtech", "fintech"],
      business: ["negocios", "empresa", "negocio", "emprendedor", "financiamiento", "inversión", "capital", "funding", "nearshoring", "mercado"],
      startups: ["startup", "emprendimiento", "unicornio", "financiamiento", "funding", "inversión", "capital", "ecosistema", "fundraising", "ronda", "serie", "emprendedor"],
      general: [], // No filtering for general
    };

    const categoryKeywords = keywords[category] || keywords.startups;
    let filteredArticles = articles;

    if (categoryKeywords.length > 0) {
      filteredArticles = articles.filter((article) => {
        const title = (article.title || "").toLowerCase();
        const description = (article.description || "").toLowerCase();
        
        return categoryKeywords.some(keyword => 
          title.includes(keyword.toLowerCase()) || 
          description.includes(keyword.toLowerCase())
        );
      });
    }

    console.log(`✅ Filtered ${filteredArticles.length} articles for category "${category}"`);

    return NextResponse.json({
      success: true,
      count: filteredArticles.length,
      message: filteredArticles.length === 0 ? "No articles found" : `${filteredArticles.length} articles found`,
      articles: filteredArticles.slice(0, limit).map((article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source,
        publishedAt: article.publishedAt,
      })),
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

