import { NextResponse } from "next/server";
import { sendOpenAi } from "@/libs/gpt";
import Newsletter from "@/models/Newsletter";
import connectMongo from "@/libs/mongoose";
import { scrapeArticles } from "@/libs/articleScraper";

/**
 * POST /api/newsletter/generate
 * Generates a newsletter from selected articles using GPT
 */
export async function POST(req) {
  await connectMongo();

  try {
    const body = await req.json();
    const { selectedArticles, category, country } = body;

    if (!selectedArticles || selectedArticles.length === 0) {
      return NextResponse.json(
        { error: "No articles selected" },
        { status: 400 }
      );
    }

    console.log(`🤖 Generating newsletter from ${selectedArticles.length} articles`);

    // Separate approved articles from regular news articles
    const approvedArticles = selectedArticles.filter(a => a.isApprovedArticle);
    const newsArticles = selectedArticles.filter(a => !a.isApprovedArticle);
    
    console.log(`📋 Processing ${approvedArticles.length} approved articles and ${newsArticles.length} news articles`);
    console.log(`✅ Approved articles will be used AS-IS (no GPT summarization)`);
    console.log(`🤖 News articles will be scraped and summarized with GPT`);

    // For approved articles, use their existing summary (HTML) - NO GPT processing
    // These articles are already written by contributors and should be shown exactly as submitted
    const approvedSummaries = approvedArticles.map((article) => {
      console.log(`📄 Using approved article as-is: "${article.title}"`);
      return {
        title: article.title,
        summary: article.summary || article.description || `Lee esta noticia sobre: ${article.title}.`,
        link: article.url && article.url.trim() ? article.url.trim() : undefined, // Only include link if url exists
        source: article.source || "Colaborador",
        image: article.image,
        titleColor: article.titleColor || "#2b3e81",
      };
    });

    // For news articles, scrape and generate summaries
    let newsSummaries = [];
    if (newsArticles.length > 0) {
      console.log("📄 Scraping article content...");
      const scrapedArticles = await scrapeArticles(newsArticles);

      // Generate summaries for each article using GPT
      for (const [index, article] of scrapedArticles.entries()) {
        console.log(`📝 Summarizing article ${index + 1}/${scrapedArticles.length}`);
        
        // Use full content if available, otherwise use description
        const contentToSummarize = article.fullContent || article.description;
        
        const summary = await sendOpenAi(
          [
            {
              role: "system",
              content: "Eres un escritor experto de newsletters tipo 'Espresso Matutino'. Tu trabajo es crear un resumen profesional y relajado (4-6 líneas, 100-150 palabras) que sea interesante de leer, con contexto suficiente para que el lector entienda completamente la noticia. Mantén un tono casual pero informativo. IMPORTANTE: NO uses saludos como 'Hola', 'Hey', 'Buenos días' o similares. Escribe directamente el contenido de la noticia.",
            },
            {
              role: "user",
              content: `Lee el siguiente artículo y crea un resumen directo e interesante en 4-6 líneas (100-150 palabras). NO uses saludos. Empieza directamente con el contenido:\n\nTítulo: ${article.title}\n\nContenido:\n${contentToSummarize.slice(0, 2000)}`,
            },
          ],
          "admin",
          300, // Increased tokens for longer summaries
          0.7 // temperature
        );

        newsSummaries.push({
          title: article.title,
          summary: summary || `Lee esta noticia sobre: ${article.title}. ${(article.fullContent || article.description).slice(0, 300)}...`,
          link: article.url,
          source: article.source || "News API",
          image: article.image,
        });

        // Small delay to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    // Combine summaries (approved articles first, then news articles)
    const summaries = [...approvedSummaries, ...newsSummaries];

    // Generate main summary of the day
    console.log("🌅 Generating main summary of the day...");
    console.log("ℹ️  Note: Approved articles included in summary context, but their individual content remains unchanged");
    // Use all articles for summary generation (both approved and news)
    // This helps GPT create a cohesive daily summary, but the approved articles' individual content stays as-written
    const allArticlesForSummary = [
      ...approvedArticles.map(a => ({ 
        title: a.title, 
        description: a.description || a.summary?.replace(/<[^>]*>/g, "").substring(0, 300),
        isApproved: true // Flag to indicate this is an approved article
      })),
      ...newsSummaries.map(a => ({ 
        title: a.title, 
        description: a.summary?.replace(/<[^>]*>/g, "").substring(0, 300) || a.summary,
        isApproved: false
      }))
    ];
    
    const mainSummary = await sendOpenAi(
      [
        {
          role: "system",
          content: "Eres un escritor de newsletters profesionales tipo espresso matutino. Crea un resumen principal de las noticias del día en 6-8 líneas (120-180 palabras) que conecte los temas principales y dé una visión general. Tono relajado e informativo.",
        },
        {
          role: "user",
          content: `Crea un resumen principal que conecte estas noticias del día en 6-8 líneas (120-180 palabras):\n\n${allArticlesForSummary
            .slice(0, 5)
            .map((a) => `- ${a.title}: ${(a.description || "").slice(0, 300)}`)
            .join("\n\n")}`,
        },
      ],
      "admin",
      400, // Increased tokens for longer summary
      0.7
    );

    // Generate intelligent title based on articles
    console.log("📝 Generating newsletter title...");
    const generatedTitle = await sendOpenAi(
      [
        {
          role: "system",
          content: "Eres un experto en crear títulos atractivos para newsletters. Crea un título conciso (máximo 80 caracteres) que capture la esencia de las noticias principales. El título debe ser interesante, informativo y profesional. NO incluyas emojis, fechas ni la palabra 'Newsletter'. Solo el título.",
        },
        {
          role: "user",
          content: `Basándote en estas noticias principales, crea un título atractivo para el newsletter del día:\n\n${allArticlesForSummary
            .slice(0, 5)
            .map((a) => `- ${a.title}`)
            .join("\n")}\n\nResumen del día:\n${mainSummary || "Noticias del día"}\n\nCrea un título único y atractivo (máximo 80 caracteres, sin emojis ni fechas):`,
        },
      ],
      "admin",
      100, // Short response for title
      0.8 // Slightly higher temperature for creativity
    );

    // Clean and format the title
    let newsletterTitle = generatedTitle 
      ? generatedTitle.trim().replace(/^["']|["']$/g, '').slice(0, 80) // Remove quotes and limit length
      : null;

    // Fallback to default title if GPT didn't generate a good one
    if (!newsletterTitle || newsletterTitle.length < 10) {
      console.log("⚠️ Generated title too short, using default");
      newsletterTitle = `☕ Newsletter ${category.charAt(0).toUpperCase() + category.slice(1)} - ${new Date().toLocaleDateString()}`;
    } else {
      // Add date if not present and make it look professional
      const dateStr = new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      newsletterTitle = `${newsletterTitle} - ${dateStr}`;
    }

    console.log(`✅ Generated title: ${newsletterTitle}`);

    // Create newsletter
    const newsletterData = {
      title: newsletterTitle,
      date: new Date(),
      status: "draft",
      content: {
        summary: mainSummary || "Resumen del día",
        articles: summaries,
      },
      sentCount: 0,
    };

    const newsletter = await Newsletter.create(newsletterData);

    console.log(`✅ Newsletter created: ${newsletter._id}`);

    return NextResponse.json({
      success: true,
      newsletter: {
        id: newsletter._id,
        title: newsletter.title,
        summary: newsletter.content.summary,
        articles: newsletter.content.articles,
      },
    });
  } catch (error) {
    console.error("❌ Error generating newsletter:", error);

    // Check if it's an OpenAI API key issue
    if (error.message?.includes("API key") || error.message?.includes("OpenAI")) {
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API key not configured. Add OPENAI_API_KEY to .env.local",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error generating newsletter",
      },
      { status: 500 }
    );
  }
}

