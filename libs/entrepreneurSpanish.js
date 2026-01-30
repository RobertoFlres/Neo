import axios from "axios";
import cheerio from "cheerio";
import { filterByCategory } from "./categoryKeywords";

/**
 * Scrape Entrepreneur Spanish Tech News
 * https://spanish.entrepreneur.com/tecnologia
 *
 * @param {number} limit - Number of articles to fetch
 * @returns {Promise<Array>} Array of articles
 */
export const getEntrepreneurSpanishArticles = async (limit = 20) => {
  try {
    console.log("📰 Scraping Entrepreneur Spanish...");

    // Fetch from multiple sections for more content
    const sections = [
      "https://spanish.entrepreneur.com/tecnologia",
      "https://spanish.entrepreneur.com/emprendedores",
      "https://spanish.entrepreneur.com/startups",
    ];

    const allArticles = [];

    for (const sectionUrl of sections) {
      try {
        const response = await axios.get(sectionUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
          timeout: 15000,
        });

        const $ = cheerio.load(response.data);

        // Get all article links
        $("a[href]").each((_, element) => {
          try {
            const link = $(element).attr("href");

            // Filter for article links
            if (
              link &&
              (link.includes("/tecnologia/") ||
                link.includes("/emprendedores/") ||
                link.includes("/startups/") ||
                link.includes("/finanzas/"))
            ) {
              const titleElement = $(element).find("h2, h3, h4, p").first();
              let title =
                titleElement.text()?.trim() ||
                $(element).attr("title") ||
                $(element).text()?.trim() ||
                "";

              // Clean up title
              title = title.replace(/\s+/g, " ").trim();

              if (title.length > 15) {
                const fullUrl = link.startsWith("http")
                  ? link
                  : `https://spanish.entrepreneur.com${link}`;

                allArticles.push({
                  title,
                  description: "",
                  url: fullUrl,
                  source: "Entrepreneur Español",
                  publishedAt: new Date().toISOString(),
                  image: null,
                });
              }
            }
          } catch (error) {
            // Ignore errors for individual links
          }
        });
      } catch (error) {
        console.log(`⚠️ Error fetching ${sectionUrl}:`, error.message);
      }
    }

    // Remove duplicates
    const uniqueArticles = Array.from(
      new Map(allArticles.map((article) => [article.url, article])).values()
    );

    console.log(`✅ Scraped ${uniqueArticles.length} articles from Entrepreneur Spanish`);

    return uniqueArticles.slice(0, limit);
  } catch (error) {
    console.error("❌ Error scraping Entrepreneur Spanish:", error.message);
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
export const getEntrepreneurTechNews = async (category = "technology", limit = 15) => {
  try {
    const articles = await getEntrepreneurSpanishArticles(limit * 3);

    // Use centralized category filtering (strict mode)
    const filteredArticles = filterByCategory(articles, category, true);

    const result = filteredArticles.slice(0, limit);

    console.log(`✅ Entrepreneur ES: ${result.length}/${articles.length} articles matched category "${category}"`);

    return result;
  } catch (error) {
    console.error("❌ Error filtering Entrepreneur news:", error.message);
    return [];
  }
};
