import { NextResponse } from "next/server";
import { getNoroArticles } from "@/libs/noro";

/**
 * Test endpoint for Noro.mx
 * GET /api/test-noro?section=tecnologia&limit=10
 * Fetch from both tecnologia and negocios by default
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "startups";
    const limit = parseInt(searchParams.get("limit")) || 50;

    console.log(`📰 Fetching ${limit} articles from Noro.mx (category: ${category})`);

    // Map category to Noro sections
    const categoryToSection = {
      technology: "tecnologia",
      business: "negocios",
      startups: "negocios", // Startups are usually in negocios section
      general: "all",
    };

    const section = categoryToSection[category] || "all";
    let articles = [];
    
    if (section === "all") {
      // Fetch from both sections
      const techArticles = await getNoroArticles('tecnologia', 50);
      const businessArticles = await getNoroArticles('negocios', 50);
      articles = [...techArticles, ...businessArticles];
    } else {
      articles = await getNoroArticles(section, limit * 2); // Get more to filter
    }
    
    // Remove duplicates
    const uniqueArticles = Array.from(
      new Map(articles.map(article => [article.url, article])).values()
    );

    // Apply category filtering using keywords
    const keywords = {
      technology: ["IA", "inteligencia artificial", "tecnología", "tech", "ChatGPT", "AI", "software", "semiconductores", "digital", "innovación", "edtech", "fintech"],
      business: ["negocios", "empresa", "negocio", "emprendedor", "financiamiento", "inversión", "capital", "funding", "nearshoring", "mercado"],
      startups: ["startup", "emprendimiento", "unicornio", "financiamiento", "funding", "inversión", "capital", "ecosistema", "fundraising", "ronda", "serie", "emprendedor"],
      general: [], // No filtering for general
    };

    const categoryKeywords = keywords[category] || keywords.startups;
    let filteredArticles = uniqueArticles;

    if (categoryKeywords.length > 0) {
      filteredArticles = uniqueArticles.filter((article) => {
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
    console.error("❌ Error in test-noro:", error.message);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

