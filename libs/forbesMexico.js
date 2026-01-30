import axios from "axios";
import { JSDOM } from "jsdom";
import { filterByCategory } from "./categoryKeywords";

/**
 * Scrape articles from Forbes México
 * https://forbes.com.mx - Business and entrepreneurship news
 *
 * @param {number} limit - Number of articles to fetch
 * @returns {Promise<Array>} Array of articles
 */
export const getForbesMexicoArticles = async (limit = 30) => {
  try {
    console.log("📰 Scraping Forbes México...");

    // Fetch from multiple sections
    const sections = [
      "https://www.forbes.com.mx/emprendedores/",
      "https://www.forbes.com.mx/tecnologia/",
      "https://www.forbes.com.mx/negocios/",
      "https://www.forbes.com.mx/actualidad/",
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

        const dom = new JSDOM(response.data);
        const document = dom.window.document;

        // Get all article links
        const allLinks = document.querySelectorAll("a[href]");

        allLinks.forEach((element) => {
          try {
            const link = element.href || element.getAttribute("href");

            // Filter for article links
            if (
              link &&
              link.includes("forbes.com.mx") &&
              !link.includes("/author/") &&
              !link.includes("/categoria/") &&
              !link.includes("/tag/") &&
              !link.includes("/page/") &&
              !link.includes("/wp-content/") &&
              !link.includes("/wp-admin/") &&
              !link.endsWith("/emprendedores/") &&
              !link.endsWith("/tecnologia/") &&
              !link.endsWith("/negocios/") &&
              !link.endsWith("/actualidad/") &&
              link !== "https://www.forbes.com.mx/" &&
              link !== "https://forbes.com.mx/"
            ) {
              // Check if it looks like an article URL
              const isArticle = /\/\d{4}\/\d{2}\/|\/[a-z0-9-]{15,}/.test(link);

              if (isArticle) {
                const titleElement = element.querySelector("h2, h3, h4, .title") || element;
                let title =
                  titleElement.textContent?.trim() ||
                  element.getAttribute("title") ||
                  element.textContent?.trim() ||
                  "";

                // Clean up title
                title = title.replace(/\s+/g, " ").trim();

                // Get description if available
                let description = "";
                const descElement = element.closest("article")?.querySelector("p, .excerpt, .summary");
                if (descElement) {
                  description = descElement.textContent?.trim() || "";
                }

                if (title.length > 15 && title.length < 300) {
                  const fullUrl = link.startsWith("http") ? link : `https://www.forbes.com.mx${link}`;

                  allArticles.push({
                    title,
                    description: description.substring(0, 200),
                    url: fullUrl,
                    source: "Forbes México",
                    publishedAt: new Date().toISOString(),
                    image: null,
                  });
                }
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

    console.log(`✅ Scraped ${uniqueArticles.length} articles from Forbes México`);

    return uniqueArticles.slice(0, limit);
  } catch (error) {
    console.error("❌ Error scraping Forbes México:", error.message);
    return [];
  }
};

/**
 * Get Forbes México articles filtered by category
 *
 * @param {string} category - Category to filter (technology, business, startups)
 * @param {number} limit - Number of articles
 * @returns {Promise<Array>} Filtered articles
 */
export const getForbesMexicoNews = async (category = "business", limit = 15) => {
  try {
    const articles = await getForbesMexicoArticles(limit * 3);

    // Use centralized category filtering (strict mode)
    const filteredArticles = filterByCategory(articles, category, true);

    const result = filteredArticles.slice(0, limit);

    console.log(`✅ Forbes México: ${result.length}/${articles.length} articles matched category "${category}"`);

    return result;
  } catch (error) {
    console.error("❌ Error filtering Forbes México news:", error.message);
    return [];
  }
};
