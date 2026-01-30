import axios from "axios";
import cheerio from "cheerio";
import { filterByCategory } from "./categoryKeywords";

/**
 * Scrape Expansión Tech News
 * https://expansion.mx/tecnologia
 *
 * @param {number} limit - Number of articles to fetch
 * @returns {Promise<Array>} Array of articles
 */
export const getExpansionArticles = async (limit = 20) => {
  try {
    console.log("📰 Scraping Expansión...");

    const response = await axios.get("https://expansion.mx/tecnologia", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);

    const articles = [];

    // Get all links from the page
    $("a[href]").each((_, element) => {
      try {
        const link = $(element).attr("href");

        // Filter for technology links
        if (link && (link.includes("/tecnologia/") || link.includes("/emprendedores/"))) {
          const titleElement = $(element).find("h2, h3, h4, p").first();
          let title =
            titleElement.text()?.trim() ||
            $(element).attr("title") ||
            $(element).text()?.trim() ||
            "";

          // Clean up title
          title = title.replace(/\s+/g, " ").trim();

          // Only add if we have a meaningful title (more than 15 chars)
          if (title.length > 15) {
            const fullUrl = link.startsWith("http") ? link : `https://expansion.mx${link}`;

            articles.push({
              title,
              description: "",
              url: fullUrl,
              source: "Expansión",
              publishedAt: new Date().toISOString(),
              image: null,
            });
          }
        }
      } catch (error) {
        // Ignore errors for individual links
      }
    });

    // Remove duplicates
    const uniqueArticles = Array.from(
      new Map(articles.map((article) => [article.url, article])).values()
    );

    console.log(`✅ Scraped ${uniqueArticles.length} articles from Expansión`);

    return uniqueArticles.slice(0, limit);
  } catch (error) {
    console.error("❌ Error scraping Expansión:", error.message);
    return [];
  }
};

/**
 * Get tech news filtered by category using centralized keywords
 *
 * @param {string} category - Category to filter (technology, business, startups)
 * @param {number} limit - Number of articles
 * @returns {Promise<Array>} Filtered articles
 */
export const getExpansionTechNews = async (category = "technology", limit = 15) => {
  try {
    const articles = await getExpansionArticles(limit * 3);

    // Use centralized category filtering (strict mode)
    const filteredArticles = filterByCategory(articles, category, true);

    const result = filteredArticles.slice(0, limit);

    console.log(`✅ Expansión: ${result.length}/${articles.length} articles matched category "${category}"`);

    return result;
  } catch (error) {
    console.error("❌ Error filtering Expansión news:", error.message);
    return [];
  }
};
